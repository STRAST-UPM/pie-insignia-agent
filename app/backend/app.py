from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
import mimetypes
import io
import os
import sys
from supabase import create_client, Client
import pypdf
from typing import List, Dict, Any, Optional

# Local imports
from config import get_settings
from utils import (
    generate_session_id, 
    extract_text_from_content,
    validate_file_type
)

# Configure UTF-8 encoding for logging (only if needed on Windows)
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load settings with error handling
try:
    settings = get_settings()
except Exception as e:
    print(f"Error loading settings: {e}")
    print("Please ensure you have a .env file with the required environment variables.")
    print("Check .env.example for the required format.")
    sys.exit(1)

# Configure OpenAI API key explicitly
os.environ["OPENAI_API_KEY"] = settings.openai_api_key

# Import OpenAI agents after setting API key
from agents import Agent, FileSearchTool, Runner

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

# Load system prompt
system_prompt = "You are a helpful assistant."
try:
    with open("system_prompt.txt", "r", encoding="utf-8") as file:
        system_prompt = file.read()
except FileNotFoundError:
    print("Warning: system_prompt.txt not found. Using default system prompt.")

# Initialize FastAPI app
app = FastAPI(
    title="ISST Tutoring AI Agent Backend",
    debug=settings.debug
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# In-memory storage for conversation histories
session_histories: Dict[str, List[Dict[str, Any]]] = {}

async def log_to_supabase(session_id: str, role: str, content: str) -> None:
    """Log conversation to Supabase with error handling."""
    try:
        data = {"session_id": session_id, "role": role, "content": content}
        supabase.table("chat_logs").insert(data).execute()
    except Exception as e:
        print(f"Error logging to Supabase: {e}")

# Initialize Search Tool and Agent
try:
    search_tool = FileSearchTool(vector_store_ids=[settings.vector_store_id])
    isst_agent = Agent(
        name="ISST Teaching Assistant",
        instructions=system_prompt,
        model="gpt-4o",
        tools=[search_tool]
    )
    print("✅ Agent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize agent: {e}")
    sys.exit(1)

class ChatResponse(BaseModel):
    respuesta: str
    session_id: str

# Exception handler for better error responses
@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    print(f"Validation error for {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error. Please check your request format."}
    )

async def process_uploaded_files(files: List[UploadFile]) -> tuple[List[Dict[str, Any]], List[str]]:
    """Process uploaded files and extract content."""
    user_message_content_parts = []
    processed_files_info = []
    
    allowed_types = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp']

    for file_upload in files:
        if not validate_file_type(file_upload.filename or "", allowed_types):
            print(f"Warning: Unsupported file type: {file_upload.filename}")
            continue
        
        try:
            file_bytes = await file_upload.read()
            await file_upload.close()

            mime_type = file_upload.content_type or mimetypes.guess_type(file_upload.filename or "")[0] or "application/octet-stream"

            if mime_type == "application/pdf":
                pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                pdf_text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
                user_message_content_parts.append({
                    "type": "input_text", 
                    "text": f'Contenido del PDF adjunto (\'{file_upload.filename}\'):\n---BEGIN PDF CONTENT---\n{pdf_text}\n---END PDF CONTENT---'
                })
                processed_files_info.append(f"Adjunto PDF: {file_upload.filename}")
            elif mime_type.startswith("image/"):
                base64_image = base64.b64encode(file_bytes).decode('utf-8')
                user_message_content_parts.append({
                    "type": "input_image",
                    "image_url": f"data:{mime_type};base64,{base64_image}"                })
                processed_files_info.append(f"Adjunto Imagen: {file_upload.filename}")
        except Exception as e:
            print(f"Error processing file {file_upload.filename}: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing file: {file_upload.filename}")

    return user_message_content_parts, processed_files_info

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint_handler(
    pregunta: str = Form(""),
    session_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[])
):
    try:
        print(f"Chat request received - session_id: {session_id}, files: {len(files) if files else 0}")
        
        if not pregunta.strip() and not files:
            raise HTTPException(status_code=400, detail="Question and files cannot both be empty.")

        user_message_content_parts = []
        processed_files_info = []

        if files:
            user_message_content_parts, processed_files_info = await process_uploaded_files(files)

        if pregunta.strip():
            user_message_content_parts.insert(0, {"type": "input_text", "text": pregunta})

        if not user_message_content_parts:
            raise HTTPException(status_code=400, detail="No processable content in request.")

        current_session_id = session_id or generate_session_id()
        current_history = session_histories.setdefault(current_session_id, [])

        current_history.append({"role": "user", "content": user_message_content_parts})

        log_content = pregunta
        if processed_files_info:
            log_content += f" ({', '.join(processed_files_info)})"

        await log_to_supabase(current_session_id, "user", log_content)

        result = await Runner.run(isst_agent, current_history)
        respuesta_limpia = extract_text_from_content(result.final_output)

        await log_to_supabase(current_session_id, "assistant", respuesta_limpia)

        current_history.append({"role": "assistant", "content": respuesta_limpia})

        return ChatResponse(respuesta=respuesta_limpia, session_id=current_session_id)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "vector_store_id": settings.vector_store_id
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.app_host, port=settings.app_port)