# ISST AI Tutoring Assistant - Full Stack Integration

This project integrates a Python-based AI tutoring agent (ISST Teaching Assistant) with a modern web frontend.

## Project Structure

- **/backend**: Contains the FastAPI Python server that exposes the AI agent via an API.
- **/frontend**: Contains the React (Vite + TypeScript) frontend application for user interaction.

## Prerequisites

- **Node.js and npm/yarn**: For running the frontend.
- **Python (3.9+ recommended)**: For running the backend.
- **OpenAI API Key**: The AI agent is designed to work with OpenAI's services. You'll need an API key.

## Running the System End-to-End

Follow these steps to run the complete application locally:

### 1. Backend Setup & Start

Navigate to the `backend` directory and execute the following commands:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Edit .env with your OPENAI_API_KEY and confirm VECTOR_STORE_ID
uvicorn app:app --reload --port 8000
```

The backend should now be running on http://localhost:8000.

### 2. Frontend Setup & Start

Navigate to the `frontend` directory in a new terminal and execute the following commands:

```bash
cd .frontend
npm install
npm run dev
```

The frontend should now be running, typically on http://localhost:5173.

### 3. Access the Application

Open your web browser and go to http://localhost:5173 (or the port shown by Vite). You should see the AI Tutoring Assistant interface and be able to interact with it.

#### Key Features & Constraints Adherence

- Backend API: The backend exposes a /api/chat endpoint using FastAPI.
- Frontend Integration: The React frontend sends POST requests to /api/chat and displays responses.
- Session Management: Conversation history is maintained per session (identified by a session_id) in the backend's memory.
- Clean Structure: Frontend and backend are in separate, clearly structured folders.

#### Important Notes

- Agent API: The functionality of the AI heavily depends on the agent's correct configuration (e.g., OpenAI API access).
- Vector Store: The agent uses a VECTOR_STORE_ID. Ensure this ID is valid and accessible by your OpenAI API key.
