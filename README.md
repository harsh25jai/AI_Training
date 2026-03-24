# AI Training (Ace_Turtle)

A learning repository of hands-on AI & LLM workflows in Python, centered around LangChain, embeddings, RAG, document ingestion, and fine-tuning. The codebase is primarily a sequence of Jupyter notebooks that grow from basic API integration to advanced RAG pipelines.

## 🚀 Project Overview

- **Name**: ai-training
- **Python requirement**: `>=3.12`
- **Core libraries**: `langchain`, `chromadb`, `fastapi`, `openai`, `pymupdf`, `pytesseract`, `uvicorn`, etc.
- **Entry script**: `main.py` (simple placeholder print).
- **Package metadata**: `pyproject.toml`.
- **Notebooks**: day1..day15 series with incremental lessons.

## 📁 Repository structure

- [day1/](day1/) — Basic Python + OpenAI API integration.
- [day2/](day2/) — API and AI integration patterns.
- [day3/](day3/) — Containerization and docker folder structure.
- [day4/](day4/) — Tokenization and tokenizer internals.
- [day5/](day5/) — Embeddings + vector DB with Chroma.
- [day6/](day6/) — Agent skills and multi-tool agent design.
- [day7/](day7/) — MCP server concepts (Model Context Protocol).
- [day8/](day8/) — Devcontext walkthrough for richer prompt management.
- [day10/](day10/) — LangChain basics part 1.
- [day11/](day11/) — LangChain RAG pipeline part 2.
- [day12/](day12/) — PDF extraction starter.
- [day13/](day13/) — RAG integration and document QA.
- [day14/](day14/) — Document-specific question answering.
- [day15/](day15/) — Fine-tuning demonstration.
- [setup/](setup/) — platform-specific setup guides ([SETUP-mac.md](setup/SETUP-mac.md), [SETUP-linux.md](setup/SETUP-linux.md), [SETUP-PC.md](setup/SETUP-PC.md)).

## ⚙️ Setup (macOS, Linux, Windows)

1. Clone repository.
2. Install `uv` as described in `setup/SETUP-*.md`.
3. `cd ai_training` root.
4. `uv sync`
5. Optional: create `.env` with keys:
   - `OPENAI_API_KEY`
   - `HF_TOKEN`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_API_KEY`
6. Launch VS Code and run notebooks with Python kernel pointing to `.venv`.

### 🧩 Install Jupyter + Notebook Extensions

- Install or verify `jupyter` is available:
  ```bash
  uv run python -m pip install --upgrade jupyter jupyterlab
  ```
- Install `jupyter_contrib_nbextensions`:
  ```bash
  uv run python -m pip install jupyter_contrib_nbextensions
  uv run python -m jupyter contrib nbextension install --user
  ```
- Enable popular extensions (e.g., table of contents, codefolding, spellchecker):
  ```bash
  uv run python -m jupyter nbextension enable toc2/main
  uv run python -m jupyter nbextension enable codefolding/main
  uv run python -m jupyter nbextension enable spellchecker/main
  ```
- Start Jupyter Notebook:
  ```bash
  uv run jupyter notebook
  ```

### 🧠 Select kernel in VS Code

1. Open notebook (`dayX/*.ipynb`) in VS Code.
2. Click `Select Kernel` at top right.
3. Choose `Python Environments...`.
4. Pick the `ai-training` kernel or `.venv` environment, then confirm.
5. If kernel is missing, install ipykernel:
   ```bash
   uv run python -m ipykernel install --user --name ai-training --display-name "Python (AI Training)"
   ```

## ▶️ Run quick script

```bash
uv run python main.py
```

## 🧪 Typical notebook workflow

- Open notebook in `dayX/`
- Select kernel `Python (.venv)`
- Run all cells sequentially
- Use `.env` keys for API usage

## 🔍 What to inspect next

- `pyproject.toml`: dependency pins
- `setup/SETUP-*.md`: environment build
- Each notebook (day*) for context and code patterns
