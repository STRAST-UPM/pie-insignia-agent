# ISST AI Tutor Backend

## ⚙️ Setup

It is highly recommended to use a virtual environment to manage dependencies and isolate the project.

1.  **Create a virtual environment:**

    ```bash
    python -m venv venv
    ```

2.  **Activate the virtual environment:**

    - On Windows:

      - **Command Prompt**:
        ```cmd
        venv\Scripts\activate.bat
        ```
      - **PowerShell**:
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
      - **Git Bash**:
        ```bash
        source venv/Scripts/activate
        ```

    - On macOS and Linux:
      ```bash
      source venv/bin/activate
      ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## 🚀 Quick Start

```bash
python start.py              # Fast startup with essential checks
python start.py --verify     # Full verification with API connectivity tests
uvicorn app:app --reload --port 8000 # Run without any checks
```

## 📋 Verification Levels

### Essential Checks (Default)

- ✅ .env file validation
- ✅ system_prompt.txt exists
- ✅ Configuration validation

### Full Verification (--verify flag)

- 🔍 All essential checks +
- 🌐 OpenAI API connectivity
- 🗃️ Vector Store accessibility
- 🗄️ Supabase database connection
