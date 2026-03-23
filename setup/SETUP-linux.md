# AI Hands-on Training

## Linux Setup with `uv` and Jupyter Notebooks in VS Code

Use these steps to clone the course repository, install dependencies with `uv`, and run the notebooks in VS Code.

## Step 1: Install Git and clone the repository

Open a terminal and check whether Git is already installed:

```bash
git --version
```

If Git is not installed, use your distro package manager. For Ubuntu or Debian:

```bash
sudo apt update
sudo apt install git
```

Then clone the repository:

```bash
mkdir -p ~/projects
cd ~/projects
git clone <repository-url> ai-training
cd ai-training
```

## Step 2: Install `uv`

Install `uv` with the official installer:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Close the terminal, open a new terminal, and verify:

```bash
uv --version
uv self update
```

## Step 3: Sync the project dependencies

From the project root, run:

```bash
uv sync
```

This creates the local virtual environment and installs the dependencies needed for the session.

## Step 4: Create your `.env` file if needed

If the notebooks use API keys, create a `.env` file in the project root:

```bash
cat > .env <<'EOF'
OPENAI_API_KEY=your_key_here
EOF
```

You can add more keys later if needed:

```text
GOOGLE_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
HF_TOKEN=your_key_here
```

## Step 5: Open the notebooks in VS Code

Install VS Code if needed, then open the cloned project folder in VS Code.

Inside VS Code:

1. Install the `Python` extension from `ms-python`.
2. Install the `Jupyter` extension from `ms-toolsai`.
3. Open the notebook for the session.
4. Click `Select Kernel`.
5. Choose `Python Environments...`.
6. Select the environment that points to `.venv`.

Run the notebook cells from top to bottom.
Each time you return to the project:

```bash
cd ~/projects/ai-training
uv sync
```

Then open the notebook in VS Code and select the `.venv` kernel.

## Troubleshooting

### `uv` is not found

Open a fresh terminal and run `uv --version` again.

### `uv sync` fails with native build errors

Install common build tools. On Ubuntu or Debian:

```bash
sudo apt update
sudo apt install build-essential
```

Then rerun:

```bash
uv sync
```

### VS Code opens the notebook but packages are missing

Run:

```bash
uv sync --refresh
```

### VS Code does not show the project kernel

Make sure the `Python` and `Jupyter` extensions are installed.

