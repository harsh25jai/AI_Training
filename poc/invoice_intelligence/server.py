import os
import re
import tempfile
import traceback
import hashlib
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from openai import OpenAI
import chromadb
from chromadb.config import Settings
import PyPDF2

from flask_cors import CORS

# ---------- Configuration ----------
OPENAI_API_KEY     = os.getenv("OPENAI_API_KEY")           # required — export before starting
EMB_MODEL_NAME     = os.getenv("OPENAI_EMB_MODEL",  "text-embedding-3-small")
DEFAULT_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

if not OPENAI_API_KEY:
    raise EnvironmentError(
        "OPENAI_API_KEY environment variable is not set.\n"
        "Export it before starting:  export OPENAI_API_KEY='sk-...'"
    )

# Single shared collection that holds chunks from ALL ingested PDFs.
# Each chunk carries a "source" metadata field with its PDF path,
# and a "pdf_id" field (MD5 of the absolute path) used to avoid
# re-ingesting the same file twice.
SHARED_COLLECTION_NAME = "all_pdfs"

# Single OpenAI client — thread-safe, reused across all requests
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(
    path=CHROMA_PERSIST_DIR,
    settings=Settings(anonymized_telemetry=False),
)

# Get-or-create the single shared collection (cosine distance is best for text)
shared_collection = chroma_client.get_or_create_collection(
    name=SHARED_COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)


# ---------- Helpers ----------

def _pdf_id(pdf_path: str) -> str:
    """Stable MD5-based identifier for a PDF file (used as a namespace prefix)."""
    return hashlib.md5(os.path.abspath(pdf_path).encode()).hexdigest()


def extract_text(pdf_path: str) -> str:
    reader = PyPDF2.PdfReader(open(pdf_path, "rb"))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunks.append(" ".join(words[i:i + chunk_size]))
        i += chunk_size - overlap
    return chunks


def embed(text: str) -> list[float]:
    """
    Embed a single string via the OpenAI Embeddings API.
    Returns a plain Python list of floats (ChromaDB-compatible).
    """
    response = openai_client.embeddings.create(
        model=EMB_MODEL_NAME,
        input=text,
    )
    return response.data[0].embedding


# ---------- Ingestion ----------

def is_pdf_ingested(pdf_path: str) -> bool:
    """Return True if at least one chunk from this PDF already exists in the shared collection."""
    pdf_id = _pdf_id(pdf_path)
    results = shared_collection.get(
        where={"pdf_id": pdf_id},
        limit=1,
        include=[],
    )
    return len(results["ids"]) > 0


def ingest_pdf(pdf_path: str) -> int:
    """
    Extract, chunk, embed and upsert a PDF into the shared collection.
    Skipped automatically if the PDF was already ingested.
    Returns the number of chunks upserted (0 if skipped).
    """
    if is_pdf_ingested(pdf_path):
        return 0

    text = extract_text(pdf_path)
    chunks = chunk_text(text)

    if not chunks:
        raise ValueError(f"No text could be extracted from: {pdf_path}")

    pdf_id = _pdf_id(pdf_path)
    abs_path = os.path.abspath(pdf_path)
    filename = os.path.basename(pdf_path)

    ids = [f"{pdf_id}-chunk-{i}" for i in range(len(chunks))]
    embeddings = [embed(chunk) for chunk in chunks]
    metadatas = [
        {
            "source": abs_path,
            "filename": filename,
            "pdf_id": pdf_id,
            "chunk_index": i,
        }
        for i in range(len(chunks))
    ]

    shared_collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


# ---------- Retrieval ----------

def retrieve_all(query: str, k: int = 15) -> list[dict]:
    total = shared_collection.count()
    if total == 0:
        return []

    # ── 1. Keyword pre-filter for IDs / invoice numbers / codes ────────────
    id_pattern = re.compile(r'[A-Z0-9]{2,}[/\-][A-Z0-9]{4,}', re.IGNORECASE)
    ids_in_query = id_pattern.findall(query)

    if ids_in_query:
        all_docs = shared_collection.get(include=["documents", "metadatas"])
        keyword_hits = [
            {
                "document": doc,
                "source":   meta.get("source",   "unknown"),
                "filename": meta.get("filename", "unknown"),
            }
            for doc, meta in zip(all_docs["documents"], all_docs["metadatas"])
            if any(qid.lower() in doc.lower() for qid in ids_in_query)
        ]
        if keyword_hits:
            return keyword_hits[:k]

    # ── 2. Customer/user intent — fetch ALL chunks so billing info is included ──
    customer_keywords = {
        "user", "customer", "buyer", "purchaser", "purchased", 
        "who bought", "billing", "bill to", "most", "highest"
    }
    if any(kw in query.lower() for kw in customer_keywords):
        all_docs = shared_collection.get(include=["documents", "metadatas"])
        return [
            {
                "document": doc,
                "source":   meta.get("source",   "unknown"),
                "filename": meta.get("filename", "unknown"),
            }
            for doc, meta in zip(all_docs["documents"], all_docs["metadatas"])
        ]

    # ── 3. Semantic search ──────────────────────────────────────────────────
    k = min(k, total)
    results = shared_collection.query(
        query_embeddings=[embed(query)],
        n_results=k,
        include=["documents", "metadatas"],
    )

    chunks = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        chunks.append({
            "document": doc,
            "source": meta.get("source", "unknown"),
            "filename": meta.get("filename", "unknown"),
        })
    return chunks


# ---------- LLM calls ----------

def openai_chat(
    system: str,
    user: str,
    model: str = DEFAULT_CHAT_MODEL,
    temperature: float = 0.2,
) -> str:
    """Single helper for all OpenAI chat completions."""
    response = openai_client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
    )
    return response.choices[0].message.content.strip()


def generate_answer(query: str, docs: str, model: str = DEFAULT_CHAT_MODEL) -> str:
    system = (
        "You are a precise document-analysis assistant. "
        "Answer the question using ONLY the context provided. "
        "If the answer is not present in the context, say so clearly. "
        "IMPORTANT: When computing quantities, counts, or totals — "
        "aggregate ALL occurrences of the same item across ALL sources. "
        "Do NOT list the same product multiple times; SUM their quantities into one row. "
        "When identifying a user or customer, extract their full name from the "
        "'Billing Address', 'Bill To', 'Billed To', 'Customer', or 'Ship To' fields. "
        "Never refer to a user by product name — always use the person's name from the invoice. "
        "CRITICAL: A single customer may appear across MULTIPLE invoices/sources. "
        "You MUST sum the total amounts across ALL their invoices to get the correct grand total. "
        "Do NOT stop at the first invoice — check every source before computing the final total. "
        "NEVER return a user's mobile number while returning user information. "
        "ARITHMETIC: After identifying all invoice amounts for a customer, "
        "you MUST explicitly add them together and state the computed grand total. "
        "Example: ₹17,999 + ₹17,999 = ₹35,998. Never restate one invoice amount as the total. "
        "SCOPE: When asked for a grand total (e.g. 'total paid', 'total revenue', "
        "'total amount'), sum ALL invoices from ALL customers — do NOT limit to one customer. "
        "Only filter by customer if the question explicitly names a specific person."
    )
    user = f"Context:\n{docs}\n\nQuestion: {query}"
    return openai_chat(system, user, model=model)

def verify_answer(answer: str, docs: str, model: str = DEFAULT_CHAT_MODEL) -> str:
    system = (
        "You are a meticulous fact-checking assistant. "
        "Compare the answer below against the provided context. "
        "Correct any inaccuracies or omissions, then return only the final answer. "
        "Specifically verify: "
        "1. If any product appears multiple times across sources, its quantity must be SUMMED. "
        "2. If the same customer appears across multiple invoices, their total purchase amount "
        "must be SUMMED across ALL invoices — not taken from just one invoice. "
        "3. ARITHMETIC CHECK: Recompute the grand total yourself by adding each invoice amount. "
        "If the answer states individual amounts but the grand total is wrong or missing, "
        "correct it. Example: ₹17,999 + ₹17,999 = ₹35,998 — never repeat one amount as total. "
        "4. SCOPE CHECK: If the question asks for a global total (e.g. 'total paid', "
        "'total revenue'), verify the answer includes ALL invoices from ALL customers, "
        "not just one customer. If any invoices are missing, add them and recompute."
    )
    user = f"Context:\n{docs}\n\nInitial Answer:\n{answer}"
    return openai_chat(system, user, model=model)


# ---------- Main RAG pipeline ----------

def self_correcting_rag(
    query: str,
    k: int = 15,
    model: str = DEFAULT_CHAT_MODEL,
    passes: int = 1,
) -> dict:
    """
    Full RAG pipeline that queries ALL PDFs stored in ChromaDB.

    1. Hybrid-retrieve the top-k most relevant chunks (keyword-first, then semantic).
    2. Generate an initial answer with OpenAI.
    3. Run *passes* self-correction rounds.

    Returns a dict with the answer and the source files that contributed context.
    """
    if shared_collection.count() == 0:
        raise ValueError("No PDFs have been ingested yet. Call /ingest first.")

    # Step 1 – retrieve across all PDFs
    chunks = retrieve_all(query, k=k)
    if not chunks:
        raise ValueError("No chunks retrieved from ChromaDB for the given query.")

    # Build context string with source annotations
    combined_docs = "\n\n".join(
        f"[Source: {c['filename']}]\n{c['document']}" for c in chunks
    )
    sources = sorted({c["source"] for c in chunks})

    # Step 2 – generate
    answer = generate_answer(query, combined_docs, model=model)

    # Step 3 – self-correct
    passes = max(1, int(passes))
    for _ in range(passes):
        answer = verify_answer(answer, combined_docs, model=model)

    return {"answer": answer, "sources": sources}


# ---------- Startup helper ----------

def preload_pdfs(pdf_paths: list[str]) -> None:
    """Ingest a list of PDFs at startup (skips already-ingested files)."""
    for path in pdf_paths:
        if not os.path.isfile(path):
            print(f"[preload] Skipping missing file: {path}")
            continue
        try:
            n = ingest_pdf(path)
            status = f"{n} chunks upserted" if n else "already ingested, skipped"
            print(f"[preload] '{os.path.basename(path)}' → {status}")
        except Exception as exc:
            print(f"[preload] Failed for {path}: {exc}")


# ---------- Flask app ----------

app = Flask(__name__)

CORS(app)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", tempfile.gettempdir())
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _save_upload(uploaded_file) -> str:
    filename = secure_filename(uploaded_file.filename)
    if not allowed_file(filename):
        raise ValueError("Only PDF files are allowed.")
    save_path = os.path.join(
        UPLOAD_DIR,
        next(tempfile._get_candidate_names()) + "_" + filename,
    )
    uploaded_file.save(save_path)
    return save_path


@app.route("/health", methods=["GET"])
def health():
    all_meta = shared_collection.get(include=["metadatas"])["metadatas"]
    unique_pdfs = sorted({m["filename"] for m in all_meta}) if all_meta else []
    return jsonify({
        "status": "ok",
        "embedding_model": EMB_MODEL_NAME,
        "chat_model": DEFAULT_CHAT_MODEL,
        "chroma_persist_dir": CHROMA_PERSIST_DIR,
        "total_chunks": shared_collection.count(),
        "ingested_pdfs": unique_pdfs,
    }), 200


@app.route("/ingest", methods=["POST"])
def handle_ingest():
    """
    Ingest one or more PDFs into the shared ChromaDB collection.

    Accepts:
    - JSON:             {"pdf_path": "/abs/path.pdf"}
                        {"pdf_paths": ["/abs/a.pdf", "/abs/b.pdf"]}
    - multipart/form:  file=<single pdf>  OR  files[]=<multiple pdfs>

    Returns JSON: {"ingested": [{"file": ..., "chunks": ..., "status": ...}, ...]}
    """
    try:
        results = []

        if request.is_json:
            payload = request.get_json()
            paths = payload.get("pdf_paths") or (
                [payload["pdf_path"]] if payload.get("pdf_path") else []
            )
            if not paths:
                return jsonify({"error": "Provide 'pdf_path' or 'pdf_paths'."}), 400
            for pdf_path in paths:
                n = ingest_pdf(pdf_path)
                results.append({
                    "file": pdf_path,
                    "chunks": n,
                    "status": "ingested" if n else "already_existed",
                })
        else:
            uploaded_files = request.files.getlist("files[]") or (
                [request.files["file"]] if "file" in request.files else []
            )
            if not uploaded_files:
                return jsonify({"error": "No file(s) provided."}), 400
            for uf in uploaded_files:
                pdf_path = _save_upload(uf)
                n = ingest_pdf(pdf_path)
                results.append({
                    "file": pdf_path,
                    "chunks": n,
                    "status": "ingested" if n else "already_existed",
                })

        return jsonify({"ingested": results}), 200

    except Exception as e:
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


@app.route("/query", methods=["POST"])
def handle_query():
    """
    Query across ALL PDFs stored in ChromaDB. No pdf_path needed.

    Accepts:
    - JSON:             {"query": "...", "k": 15, "passes": 1, "model": "gpt-4o-mini"}
    - multipart/form:  query=<text>, optional k, passes, model

    Returns JSON: {"answer": "...", "sources": ["<abs_path>", ...]}
    """
    try:
        if request.is_json:
            payload = request.get_json()
            query = payload.get("query")
            k = int(payload.get("k", 15))
            passes = int(payload.get("passes", 1))
            model = payload.get("model", DEFAULT_CHAT_MODEL)
        else:
            query = request.form.get("query") or request.values.get("query")
            k = int(request.form.get("k", request.values.get("k", 15)))
            passes = int(request.form.get("passes", request.values.get("passes", 1)))
            model = request.form.get("model", request.values.get("model", DEFAULT_CHAT_MODEL))


        if not query:
            return jsonify({"error": "Missing 'query' parameter."}), 400

        result = self_correcting_rag(query, k=k, model=model, passes=passes)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


# ---------- Entry point ----------

if __name__ == "__main__":
    PRELOAD = os.getenv("PRELOAD_PDFS", "")
    if PRELOAD:
        preload_pdfs([p.strip() for p in PRELOAD.split(",") if p.strip()])

    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5001)),
        debug=False,
    )