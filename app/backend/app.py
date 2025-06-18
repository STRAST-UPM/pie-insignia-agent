from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from dotenv import load_dotenv
import uuid
import base64
import mimetypes
import logging
from datetime import datetime
import io
import sys
from supabase import create_client, Client
import pypdf # Added for PDF processing
from typing import List, Dict, Any

# Ensure UTF-8 encoding for logging
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load environment variables
load_dotenv()

from agents import Agent, FileSearchTool, Runner

# Configuration
VECTOR_STORE_ID = os.getenv("VECTOR_STORE_ID", "vs_your_default_vector_store_id")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, VECTOR_STORE_ID]):
    raise ValueError("SUPABASE_URL, SUPABASE_KEY, and VECTOR_STORE_ID must be set in .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load system_prompt from file
try:
    with open("system_prompt.txt", "r", encoding="utf-8") as file:
        system_prompt = file.read()
except FileNotFoundError:
    system_prompt = "You are a helpful assistant." # Default prompt
    print("Warning: system_prompt.txt not found. Using default system prompt.")

# Initialize FastAPI app
app = FastAPI(title="ISST Tutoring AI Agent Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# In-memory storage for conversation histories - consider a more robust solution for production
session_histories: Dict[str, List[Dict[str, Any]]] = {}

async def log_to_supabase(session_id: str, role: str, content: str):
    try:
        data = {
            "session_id": session_id,
            "role": role,
            "content": content,
        }
        supabase.table("chat_logs").insert(data).execute()
    except Exception as e:
        # Use logging instead of print for better error handling
        logging.error(f"Error logging to Supabase: {e}")

def extract_text(final_output_content: Any) -> str:
    if isinstance(final_output_content, str):
        return final_output_content
    if isinstance(final_output_content, list):
        texts = []
        for item in final_output_content:
            if isinstance(item, dict) and item.get("type") == "text":
                texts.append(item.get("text", ""))
        return " ".join(texts).strip()
    return str(final_output_content) if final_output_content is not None else ""

# Initialize Search Tool and Agent
search_tool = FileSearchTool(vector_store_ids=[VECTOR_STORE_ID])
isst_agent = Agent(
    name="ISST Teaching Assistant",
    instructions=system_prompt,
    model="gpt-4o", # Use o3 for reasoning, gpt-4o for general purpose
    tools=[search_tool]
)

class ChatResponse(BaseModel):
    respuesta: str
    session_id: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint_handler(
    pregunta: str = Form(""),
    session_id: str | None = Form(None),
    files: List[UploadFile] = File(...)
):
    if not pregunta.strip() and not files:
        raise HTTPException(status_code=400, detail="Question and files cannot both be empty.")

    user_message_content_parts = []
    processed_files_info = []

    if files:
        for file_upload in files:
            file_bytes = await file_upload.read()
            await file_upload.close()

            mime_type = file_upload.content_type or mimetypes.guess_type(file_upload.filename or "")[0] or "application/octet-stream"

            if mime_type == "application/pdf":
                try:
                    pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                    pdf_text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
                    user_message_content_parts.append({"type": "input_text", "text": f'Contenido del PDF adjunto (\'{file_upload.filename}\'):\n---BEGIN PDF CONTENT---\n{pdf_text}\n---END PDF CONTENT---'})
                    processed_files_info.append(f"Adjunto PDF: {file_upload.filename}")
                except Exception as e:
                    logging.error(f"Error processing PDF {file_upload.filename}: {e}")
                    raise HTTPException(status_code=500, detail=f"Error processing PDF: {file_upload.filename}")
            elif mime_type.startswith("image/"):
                base64_image = base64.b64encode(file_bytes).decode('utf-8')
                user_message_content_parts.append({
                    "type": "input_image",
                    "image_url": f"data:{mime_type};base64,{base64_image}"
                })
                processed_files_info.append(f"Adjunto Imagen: {file_upload.filename}")
            else:
                logging.warning(f"Unsupported file type skipped: {file_upload.filename} ({mime_type})")

    if pregunta.strip():
        user_message_content_parts.insert(0, {"type": "input_text", "text": pregunta})

    if not user_message_content_parts:
        raise HTTPException(status_code=400, detail="No processable content in request.")

    current_session_id = session_id or str(uuid.uuid4())
    current_history = session_histories.setdefault(current_session_id, [])

    current_history.append({"role": "user", "content": user_message_content_parts})

    log_content = pregunta
    if processed_files_info:
        log_content += f" ({', '.join(processed_files_info)})"

    try:
        await log_to_supabase(current_session_id, "user", log_content)

        result = await Runner.run(isst_agent, current_history)
        respuesta_limpia = extract_text(result.final_output)

        await log_to_supabase(current_session_id, "assistant", respuesta_limpia)

        current_history.append({"role": "assistant", "content": respuesta_limpia})

        return ChatResponse(respuesta=respuesta_limpia, session_id=current_session_id)

    except Exception as e:
        logging.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)