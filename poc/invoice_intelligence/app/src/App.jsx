import { useState, useRef, useCallback } from "react";

const API_BASE = "http://127.0.0.1:5001";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --accent: #c8f545;
    --accent2: #7c3aed;
    --text: #e8e8f0;
    --muted: #;
    --danger: #ff4d6d;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px 80px;
    position: relative;
  }

  /* Subtle grid background */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(200,245,69,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,245,69,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .header {
    position: relative;
    z-index: 1;
    margin-bottom: 56px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
  }

  .header-label {
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-label::before {
    content: '';
    width: 20px;
    height: 1px;
    background: var(--accent);
    display: inline-block;
  }

  h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 16px;
  }

  h1 span {
    color: var(--accent);
  }

  .subtitle {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
    max-width: 440px;
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    font-size: 12px;
    color: var(--muted);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--muted);
    flex-shrink: 0;
  }

  .dot.online { background: var(--accent); box-shadow: 0 0 6px var(--accent); animation: pulse 2s infinite; }
  .dot.error { background: var(--danger); }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* --- Sections --- */
  .section {
    position: relative;
    z-index: 1;
    margin-bottom: 40px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section-number {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    background: rgba(200,245,69,0.1);
    border: 1px solid rgba(200,245,69,0.2);
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text);
  }

  /* --- Drop Zone --- */
  .dropzone {
    border: 1px dashed var(--border);
    border-radius: 8px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--surface);
    position: relative;
    overflow: hidden;
  }

  .dropzone::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(200,245,69,0.04) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .dropzone:hover, .dropzone.dragging {
    border-color: rgba(200,245,69,0.4);
    background: var(--surface2);
  }

  .dropzone:hover::after, .dropzone.dragging::after { opacity: 1; }

  .drop-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: var(--surface2);
  }

  .drop-text {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
  }

  .drop-text strong { color: var(--text); }

  /* --- File list --- */
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    transition: border-color 0.2s;
  }

  .file-item.success { border-color: rgba(200,245,69,0.3); }
  .file-item.error { border-color: rgba(255,77,109,0.3); }
  .file-item.loading { border-color: rgba(124,58,237,0.3); }

  .file-name { flex: 1; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file-size { color: var(--muted); flex-shrink: 0; }

  .file-status {
    font-size: 11px;
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 100px;
  }

  .file-status.ingested { background: rgba(200,245,69,0.1); color: var(--accent); }
  .file-status.error { background: rgba(255,77,109,0.1); color: var(--danger); }
  .file-status.loading { background: rgba(124,58,237,0.1); color: #a78bfa; }
  .file-status.existed { background: rgba(107,107,128,0.1); color: var(--muted); }

  .spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid rgba(167,139,250,0.3);
    border-top-color: #a78bfa;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* --- Query --- */
  .query-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .query-box:focus-within { border-color: rgba(200,245,69,0.4); }

  .query-textarea {
    width: 100%;
    min-height: 100px;
    padding: 16px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    line-height: 1.7;
    resize: vertical;
  }

  .query-textarea::placeholder { color: var(--muted); }

  .query-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid var(--border);
    gap: 12px;
    flex-wrap: wrap;
  }

  .query-options {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .option-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
  }

  .option-group label { white-space: nowrap; }

  .option-input {
    width: 48px;
    padding: 4px 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    text-align: center;
    outline: none;
  }

  .option-input:focus { border-color: rgba(200,245,69,0.4); }

  .option-select {
    padding: 4px 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    outline: none;
    cursor: pointer;
  }

  /* --- Button --- */
  .btn {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--accent);
    color: #0a0a0f;
  }

  .btn-primary:hover { background: #d4f86a; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,245,69,0.25); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  /* --- Answer --- */
  .answer-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .answer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .answer-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--accent);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
  }

  .answer-content {
    padding: 20px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .answer-sources {
    padding: 12px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .sources-label {
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-right: 4px;
  }

  .source-tag {
    font-size: 11px;
    padding: 3px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    color: var(--muted);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* --- Loading answer --- */
  .loading-answer {
    padding: 32px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--muted);
    font-size: 13px;
  }

  .loading-dots span {
    display: inline-block;
    animation: blink 1.2s ease-in-out infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

  /* --- Error box --- */
  .error-box {
    padding: 14px 16px;
    background: rgba(255,77,109,0.06);
    border: 1px solid rgba(255,77,109,0.2);
    border-radius: 6px;
    color: var(--danger);
    font-size: 12px;
    line-height: 1.6;
  }

  .ingested-count {
    font-size: 12px;
    color: var(--muted);
    margin-top: 10px;
  }

  .ingested-count strong { color: var(--accent); }
`;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default function App() {
  const [serverStatus, setServerStatus] = useState("unknown"); // unknown | online | error
  const [files, setFiles] = useState([]); // {name, size, status: loading|ingested|error|existed, error?}
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const k = 15;
  const passes = 1;
  const model = "gpt-4o-mini";
  const [queryStatus, setQueryStatus] = useState("idle"); // idle | loading | done | error
  const [answer, setAnswer] = useState(null); // {answer, sources}
  const [queryError, setQueryError] = useState("");
  const fileInputRef = useRef();

  // Check server health on mount
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) setServerStatus("online");
      else setServerStatus("error");
    } catch {
      setServerStatus("error");
    }
  }, []);

  useState(() => { checkHealth(); }, []);

  const ingestFile = async (file) => {
    const id = file.name + file.size;
    setFiles(prev => [...prev, { id, name: file.name, size: file.size, status: "loading" }]);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/ingest`, { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ingest failed");

      const result = data.ingested?.[0];
      const status = result?.status === "already_existed" ? "existed" : "ingested";
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      setServerStatus("online");
    } catch (err) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "error", error: err.message } : f));
    }
  };

  const handleFiles = (fileList) => {
    Array.from(fileList)
      .filter(f => f.type === "application/pdf")
      .forEach(ingestFile);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setQueryStatus("loading");
    setAnswer(null);
    setQueryError("");

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), k: Number(k), passes: Number(passes), model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Query failed");
      setAnswer(data);
      setQueryStatus("done");
    } catch (err) {
      setQueryError(err.message);
      setQueryStatus("error");
    }
  };

  const ingestedCount = files.filter(f => f.status === "ingested" || f.status === "existed").length;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="header-label">RAG System</div>
          <h1>Document<br /><span>Intelligence</span></h1>
          <p className="subtitle">
            Upload PDFs into ChromaDB, then ask questions across your entire document library.
          </p>
          <div className="status-bar">
            <span className={`dot ${serverStatus === "online" ? "online" : serverStatus === "error" ? "error" : ""}`} />
            <span>
              {serverStatus === "online" ? `API connected · ${API_BASE}` :
               serverStatus === "error" ? `Cannot reach ${API_BASE}` :
               "Checking API…"}
            </span>
          </div>
        </header>

        {/* --- INGEST --- */}
        <section className="section">
          <div className="section-header">
            <div className="section-number">01</div>
            <div className="section-title">Ingest Documents</div>
          </div>

          <div
            className={`dropzone${dragging ? " dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="drop-icon">📄</div>
            <p className="drop-text">
              <strong>Click to upload</strong> or drag & drop PDFs here<br />
              Each file is chunked, embedded and stored in ChromaDB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: "none" }}
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <>
              <div className="file-list">
                {files.map(f => (
                  <div key={f.id} className={`file-item ${f.status}`}>
                    {f.status === "loading" && <div className="spinner" />}
                    <span className="file-name" title={f.name}>{f.name}</span>
                    <span className="file-size">{formatSize(f.size)}</span>
                    <span className={`file-status ${f.status}`}>
                      {f.status === "loading" ? "uploading…" :
                       f.status === "ingested" ? "ingested" :
                       f.status === "existed" ? "cached" :
                       "failed"}
                    </span>
                  </div>
                ))}
              </div>
              {ingestedCount > 0 && (
                <p className="ingested-count">
                  <strong>{ingestedCount}</strong> document{ingestedCount !== 1 ? "s" : ""} ready for querying
                </p>
              )}
            </>
          )}
        </section>

        {/* --- QUERY --- */}
        <section className="section">
          <div className="section-header">
            <div className="section-number">02</div>
            <div className="section-title">Ask a Question</div>
          </div>

          <div className="query-box">
            <textarea
              className="query-textarea"
              placeholder="Ask anything about your uploaded documents…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleQuery();
              }}
            />
            <div className="query-footer">
              <button
                className="btn btn-primary"
                onClick={handleQuery}
                disabled={queryStatus === "loading" || !query.trim()}
              >
                {queryStatus === "loading" ? (
                  <><div className="spinner" style={{borderTopColor:'#0a0a0f',borderColor:'rgba(0,0,0,0.2)'}} /> Running</>
                ) : "Run Query ↵"}
              </button>
            </div>
          </div>
        </section>

        {/* --- ANSWER --- */}
        {(queryStatus === "loading" || queryStatus === "done" || queryStatus === "error") && (
          <section className="section">
            <div className="section-header">
              <div className="section-number">03</div>
              <div className="section-title">Answer</div>
            </div>

            {queryStatus === "error" ? (
              <div className="error-box">⚠ {queryError}</div>
            ) : (
              <div className="answer-box">
                <div className="answer-header">
                  <div className="answer-badge">
                    <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block'}} />
                    RAG Response
                  </div>
                  <span>{model} · k={k} · {passes} pass{passes > 1 ? "es" : ""}</span>
                </div>

                {queryStatus === "loading" ? (
                  <div className="loading-answer">
                    <div className="spinner" />
                    <span>
                      Retrieving context
                      <span className="loading-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="answer-content">{answer?.answer}</div>
                    {answer?.sources?.length > 0 && (
                      <div className="answer-sources">
                        <span className="sources-label">Sources</span>
                        {answer.sources.map(s => (
                          <span key={s} className="source-tag" title={s}>
                            {s.split("/").pop() || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}