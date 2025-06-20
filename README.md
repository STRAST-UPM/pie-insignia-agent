# ISST AI Tutor - Complete Project Suite

An advanced AI tutoring system for the ISST (Information Systems and Software Technology) course, featuring a modern full-stack web application and comprehensive vector store management tools.

## 🏗️ Project Architecture

This repository contains two main components:

```
insignia/
├── app/                       # 🌐 Full-Stack Web Application
│   ├── backend/               # FastAPI + OpenAI Agents
│   ├── frontend/              # React + TypeScript + Tailwind
│   └── supabase/              # Database migrations
├── manage-vector-store/       # 🗂️ Vector Store Management
│   ├── vector_manager.py      # Unified management utility
│   └── files/                 # PDF documents for training
```

## 🚀 Quick Start

### 1. Web Application (Production Ready)

Navigate to the `app/` directory and follow the setup instructions in `app/README.md`.

**Key Features:**

- 🔐 **Authentication**: Supabase Auth with Google/GitHub
- 💬 **Chat Interface**: Modern, responsive chat UI
- 📎 **File Upload**: PDF and image processing
- 🌙 **Dark Mode**: Theme switching
- 📱 **Responsive**: Mobile-first design

### 2. Vector Store Management

Use the unified vector store manager for file and vector operations:

```bash
cd manage-vector-store
python vector_manager.py setup --path files --name "ISST Materials"
```

## 🔧 System Requirements

- **Python 3.9+**
- **Node.js 18+**
- **OpenAI API Key**
- **Supabase Account** (for production app)

## 📊 Component Overview

### 🌐 Web Application (`app/`)

**Backend (FastAPI):**

- Centralized configuration management
- Optimized file processing (PDF, images)
- Comprehensive error handling
- Structured logging
- Type-safe code with Pydantic

**Frontend (React + TypeScript):**

- Performance optimized components
- Modern UI with Tailwind CSS
- Real-time chat interface
- File upload with preview
- Accessibility features

**Database (Supabase):**

- User authentication
- Chat history storage
- Row-level security

### 🗂️ Vector Store Management (`manage-vector-store/`)

**Unified Manager (`vector_manager.py`):**

- File upload automation
- Vector store creation
- Comprehensive CLI interface
- Error handling and logging

## 🎯 Use Cases

### For Students

- **Interactive Learning**: Ask questions about ISST course materials
- **Document Analysis**: Upload and analyze course PDFs
- **Study Sessions**: Persistent conversation history
- **Multi-modal**: Text and image-based questions

### For Educators

- **Content Management**: Easy upload of course materials
- **Usage Analytics**: Track student interactions
- **Testing Interface**: Validate AI responses
- **Customization**: Modify system prompts

### For Developers

- **Vector Store Management**: Comprehensive tooling
- **API Integration**: Clean, documented endpoints
- **Extensible Architecture**: Easy to modify and extend
- **Testing Tools**: Multiple interfaces for development

## 🧪 Testing & Development

### Development Workflow

1. **Vector Store Setup**: Use `vector_manager.py` to prepare materials
2. **Backend Development**: FastAPI with hot reload
3. **Frontend Development**: Vite with HMR
4. **Testing**: Use the web application interface for testing

### Production Deployment

1. **Environment Setup**: Configure all required environment variables
2. **Database Migration**: Apply Supabase migrations
3. **Backend Deployment**: Deploy FastAPI with proper process management
4. **Frontend Build**: Build and deploy static assets
5. **Monitoring**: Set up logging and health checks
