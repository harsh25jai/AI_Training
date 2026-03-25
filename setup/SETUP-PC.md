# AI Hands-on Training

## Windows Setup with `uv` and Jupyter Notebooks in VS Code

Use these steps to clone the course repository, install dependencies with `uv`, and run the notebooks in VS Code.

## Step 1: Install Git and clone the repository

Open PowerShell and check whether Git is already installed:

```powershell
git --version
```

If Git is not installed, download it from:

`https://git-scm.com/download/win`

Then create a projects folder, move into it, and clone the repository:

```powershell
mkdir $HOME\projects -Force
cd $HOME\projects
username: aitrainingAT
git clone https://aceturtle.git.beanstalkapp.com/ai_training.git
cd ai-training
```

If Windows blocks long file paths, run this once in an elevated PowerShell:

```powershell
git config --system core.longpaths true
```

## Step 2: Install `uv`

Install `uv` with the official installer:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Close PowerShell, open a new one, and verify:

```powershell
uv --version
uv self update
```

## Step 3: Sync the project dependencies

From the project root, run:

```powershell
uv sync
```

This creates the local virtual environment and installs the dependencies needed for the session.

## Step 4: Create your `.env` file if needed

If the notebooks use API keys, create a `.env` file in the project root:

```powershell
@"
OPENAI_API_KEY=your_key_here
"@ | Set-Content .env
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

## Optional: Register a named Jupyter kernel

If `.venv` does not appear in VS Code, run this once:

```powershell
uv run python -m ipykernel install --user --name ai-training --display-name "Python (AI Training)"
```

## Daily workflow

Each time you return to the project:

```powershell
cd $HOME\projects\ai-training
uv sync
```

Then open the notebook in VS Code and select the `.venv` kernel.

## Troubleshooting

### `uv` is not found

Open a fresh PowerShell window and run `uv --version` again.

### `uv sync` fails with native build errors

Install Microsoft C++ Build Tools, then rerun:

```powershell
uv sync
```

### VS Code opens the notebook but packages are missing

Run:

```powershell
uv sync --refresh
```

### VS Code does not show the project kernel

Make sure the `Python` and `Jupyter` extensions are installed.

If needed, run:

```powershell
uv run python -m ipykernel install --user --name ai-training --display-name "Python (AI Training)"
```
