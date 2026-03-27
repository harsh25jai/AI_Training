# VS Code Agent Skills - Quick Start Guide

This project includes **Agent Skills** that enhance GitHub Copilot's understanding of the AI training program. These skills automatically improve code suggestions and help you write better code following our standards.

## What Are Agent Skills?

Agent Skills are instruction sets that teach GitHub Copilot about:
- ✅ Python code quality standards (type hints, docstrings)
- ✅ API development patterns (FastAPI)
- ✅ Jupyter notebook best practices
- ✅ Testing and debugging workflows
- ✅ Docker containerization
- ✅ AI/ML development patterns

## Getting Started

### 1. **Reload VS Code**
After cloning this repo, reload VS Code to discover the skills:
```
macOS/Linux: Cmd + Shift + P
Windows: Ctrl + Shift + P
Type: "Developer: Reload Window"
Press Enter
```

### 2. **Open Copilot Chat**
- Click the Copilot icon in the sidebar (⚡)
- Or use: `Cmd/Ctrl + Shift + L`

### 3. **See Available Skills**
In the chat window, type `/` to see all available commands:
- `/ai-training-guide` - Get help with training program standards
- Type `/ai-training-guide [topic]` for specific help

### 4. **Ask Questions**
The agent will now understand your project context:
- "How should I write this test?"
- "Check my code for quality issues"
- "Help me structure this API endpoint"
- "How do I set up Docker for this?"

## Example Usage

### Example 1: Writing API Code
```
You: "I need to write a FastAPI endpoint for user registration"

Copilot will automatically apply:
- Type hint requirements
- Pydantic model validation patterns
- Docstring standards
- Error handling guidelines
```

### Example 2: Creating Tests
```
You: "Write a test for this function"

Copilot will automatically apply:
- pytest framework patterns
- Test naming conventions
- Test structure (Arrange-Act-Assert)
- Coverage expectations
```

### Example 3: Jupyter Notebooks
```
You: "Help me structure a notebook for Day 5"

Copilot will suggest:
- Cell organization
- Documentation standards
- Code quality requirements
- Submission format
```

## Skill Features

### Automatic Context Loading
When you:
- ✅ Open a `.py` file → Gets Python standards
- ✅ Work in Jupyter notebooks → Gets notebook standards
- ✅ Edit API code → Gets FastAPI patterns
- ✅ Write tests → Gets testing guidelines

### Slash Commands
Type `/` in chat to see:
- `/ai-training-guide` - Full skill documentation
- Other project commands

### Model Auto-Invocation
Copilot automatically loads relevant parts of the skill when:
- You ask about code quality
- You need help with specific frameworks
- You're debugging or testing
- You mention related technologies

## Key Standards to Know

### Python Code
```python
# ✅ DO: Use type hints
def process_data(items: list[str]) -> dict[str, int]:
    """Process items and return counts.
    
    Args:
        items: List of strings to process
    
    Returns:
        Dictionary with item counts
    """
    return {item: len(item) for item in items}

# ❌ DON'T: Skip type hints
def process_data(items):
    return {item: len(item) for item in items}
```

### Testing
```python
# ✅ DO: Use descriptive test names and structure
def test_process_data_returns_correct_counts():
    """Test that process_data returns correct item counts."""
    items = ["hello", "world"]
    result = process_data(items)
    assert result == {"hello": 5, "world": 5}

# ❌ DON'T: Use vague test names
def test_process():
    result = process_data(["hello"])
    assert result
```

### FastAPI
```python
# ✅ DO: Use Pydantic models and type hints
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

@app.post("/users/", response_model=User)
def create_user(user: User) -> User:
    """Create a new user."""
    return user

# ❌ DON'T: Skip validation
@app.post("/users/")
def create_user(user):
    return user
```

## Troubleshooting

### Skills Not Showing Up?
1. Close VS Code completely
2. Reopen the project folder
3. Wait a few seconds for Copilot to initialize
4. Type `/` in chat - skills should appear

### Copilot Not Applying Standards?
1. Be specific in your questions
2. Reference the framework (e.g., "FastAPI endpoint")
3. Type `/ai-training-guide` first to load the full skill
4. Ask follow-up questions to refine the output

### Want to View the Raw Skill?
See [`.github/skills/ai-training-guide/SKILL.md`](.github/skills/ai-training-guide/SKILL.md)

## Learning Resources

- 📖 [VS Code Agent Skills Docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- 📖 [Agent Skills Standard](https://agentskills.io/)
- 📖 [GitHub Copilot in VS Code](https://code.visualstudio.com/docs/copilot/overview)

## Pro Tips

1. **Use specific context**: "I'm writing an endpoint in `app/api/endpoints.py`"
2. **Reference days**: "I'm on Day 5 - embeddings and Chroma"
3. **Ask for templates**: "Show me a template for a test file"
4. **Chain requests**: Build on previous answers in the same chat
5. **Review suggestions**: Always review Copilot's code before using

## Next Steps

1. ✅ Reload VS Code (already done above)
2. ✅ Open Copilot chat (`Cmd/Ctrl + Shift + L`)
3. ✅ Type `/ai-training-guide` to test the skill
4. ✅ Start coding with Copilot's enhanced context!

---

**Happy coding!** 🚀

The Agent Skills are now helping ensure high code quality and consistency across the AI training program.
