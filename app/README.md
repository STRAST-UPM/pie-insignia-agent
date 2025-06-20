# ISST AI Tutoring Assistant

A modern full-stack AI tutoring application built with React, FastAPI, and OpenAI's GPT.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **Python** (3.9+)
- **OpenAI API Key**
- **Supabase Account**

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python start.py
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

## 📁 Project Structure

```
app/
├── backend/                # FastAPI Python server
│   ├── app.py              # Main application
│   ├── config.py           # Configuration management
│   ├── utils.py            # Utility functions
│   ├── system_prompt.txt   # AI system prompt
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript frontend
│   └── src/                # Source code
└── supabase/               # Database migrations
    └── migrations/         # SQL migration files
```

## 🛠️ Development

### Backend Commands

```bash
python start.py              # Start with basic checks
python start.py --verify     # Start with full verification
```

### Frontend Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📊 API Reference

### Health Check

```bash
GET /health
```

Returns system status and configuration info.

### Chat Endpoint

```bash
POST /chat
Content-Type: application/json

{
  "pregunta": "Your question",
  "session_id": "optional-session-id",
  "archivos": []  // Optional file attachments
}
```
