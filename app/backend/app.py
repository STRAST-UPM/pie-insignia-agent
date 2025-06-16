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
from typing import List # Import List

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

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load system_prompt from file
with open("system_prompt.txt", "r", encoding="utf-8") as file:
    system_prompt = file.read()

# Initialize FastAPI app
app = FastAPI(title="ISST Tutoring AI Agent Backend")

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for conversation histories
session_histories = {}

async def log_to_supabase(session_id: str, role: str, content: str):
    try:
        data = {
            "session_id": session_id,
            "role": role,
            "content": content,
        }
        supabase.table("chat_logs").insert(data).execute()
    except Exception as e:
        print(f"Error logging to Supabase: {e}")

def extract_text(final_output_content):
    if isinstance(final_output_content, str):
        return final_output_content
    if isinstance(final_output_content, list):
        texts = []
        for item in final_output_content:
            if isinstance(item, str):
                texts.append(item)
            elif isinstance(item, dict) and item.get("type") == "text":
                text_content = item.get("text", {})
                value = text_content.get("value") if isinstance(text_content, dict) else text_content
                if isinstance(value, str) and value.strip():
                    texts.append(value)
        return " ".join(texts) if texts else "No textual response could be extracted."
    return str(final_output_content) if final_output_content is not None else "No textual response could be extracted."

# Initialize Search Tool and Agent
search_tool = FileSearchTool(vector_store_ids=[VECTOR_STORE_ID])
isst_agent = Agent(
    name="ISST Teaching Assistant",
    instructions=system_prompt,
    model="gpt-4o",
    tools=[search_tool]
)

class ChatResponse(BaseModel):
    respuesta: str
    session_id: str
    # Removed image_received_filename as we now handle multiple files and their names are part of the logged question
    # If specific feedback on received files is needed, it could be added as a list of strings here.

class Message(BaseModel):
    user: str
    message: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint_handler(
    pregunta: str = Form(""),
    session_id: str | None = Form(None),
    files: List[UploadFile] = File(None) # Changed to handle multiple file uploads
):
    if not pregunta.strip() and not files: # Check if pregunta is empty and no files are uploaded
        raise HTTPException(status_code=400, detail="La pregunta no puede estar vacía si no se adjunta imagen.")

    user_message_content_parts = []
    file_upload_filenames_for_response = [] # Changed to a list to handle multiple files

    # Initialize pregunta_to_log with the original question for logging purposes
    pregunta_to_log = pregunta 

    # Process each uploaded file
    if files: # Check if any files are uploaded
        for file_upload in files: # Iterate through each uploaded file
            if file_upload.filename: # Check if the file has a filename
                file_upload_filenames_for_response.append(file_upload.filename) # Add to response list
            
            file_bytes = await file_upload.read() # Read the file
            await file_upload.close() # Close the file after reading
            
            mime_type = file_upload.content_type # Get the MIME type of the file
            if not mime_type or mime_type == "application/octet-stream":
                mime_type = mimetypes.guess_type(file_upload.filename or "input_file")[0] # Guess the MIME type
                if not mime_type: 
                    mime_type = "application/octet-stream" # Default MIME type if it can't be guessed

            if mime_type == "application/pdf":
                try:
                    pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                    pdf_text = ""
                    for page in pdf_reader.pages:
                        pdf_text += page.extract_text() or "" # Extract text from each page of the PDF
                    
                    # Prepend PDF text to the user's question
                    if pregunta.strip():
                        pregunta = f"Contenido del PDF adjunto ('{file_upload.filename}'):\\n---BEGIN PDF CONTENT---\\n{pdf_text}\\n---END PDF CONTENT---\\n\\nPregunta del usuario: {pregunta}"
                    else:
                        pregunta = f"Contenido del PDF adjunto ('{file_upload.filename}'):\\n---BEGIN PDF CONTENT---\\n{pdf_text}\\n---END PDF CONTENT---"
                    
                    # Update pregunta_to_log to include a note about the PDF for logging
                    pregunta_to_log += f" (Adjunto PDF: {file_upload.filename})"

                    # The agent will receive the PDF content as part of the modified 'pregunta'.
                    # No separate 'input_image' part is added for PDFs.
                    # We can add a text part indicating a PDF was processed, if desired for the history.
                    # user_message_content_parts.append({
                    #     "type": "input_text",
                    #     "text": f"[Se ha procesado el PDF '{file_upload.filename}'. Su contenido ha sido añadido a la pregunta.]"
                    # })

                except Exception as e:
                    # Log the error and inform the user
                    print(f"Error processing PDF {file_upload.filename}: {e}")
                    raise HTTPException(status_code=500, detail=f"Error al procesar el archivo PDF: {file_upload.filename}. Detalles: {str(e)}")

            elif mime_type.startswith("image/"):
                base64_image = base64.b64encode(file_bytes).decode('utf-8')
                image_url_data = f"data:{mime_type};base64,{base64_image}"
                user_message_content_parts.append({
                    "type": "input_image", 
                    "image_url": image_url_data
                })
                # Update pregunta_to_log for images as well
                pregunta_to_log += f" (Adjunto Imagen: {file_upload.filename})"
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime_type}. Please upload an image or a PDF.")

    # Add the main text question (potentially modified with PDF content)
    if pregunta.strip(): # Ensure pregunta is not empty after PDF processing (e.g. if only PDF was sent)
        user_message_content_parts.insert(0, {"type": "input_text", "text": pregunta})
    elif not user_message_content_parts and not files: # If no text and no file (or file was PDF and only added to pregunta)
         raise HTTPException(status_code=400, detail="La pregunta no puede estar vacía.")


    current_session_id = session_id or str(uuid.uuid4())
    current_history = session_histories.setdefault(current_session_id, [])
    
    # Add the (potentially combined) message to history
    current_history.append({"role": "user", "content": user_message_content_parts})

    try:
        # Log user message (original question + note about attachment) to Supabase
        await log_to_supabase(current_session_id, "user", pregunta_to_log)

        result = await Runner.run(isst_agent, current_history)
        respuesta_limpia = extract_text(result.final_output)

        # Log assistant response to Supabase
        await log_to_supabase(current_session_id, "assistant", respuesta_limpia)

    except Exception as e:
        error_str = str(e).upper()
        detail = "Lo siento, ocurrió un error al procesar tu pregunta."
        if "OPENAI_API_KEY" in error_str or "AUTHENTICATION" in error_str:
            detail = "Error de autenticación con el servicio de IA. Por favor, verifica la configuración."
        elif "CONNECTION" in error_str:
            detail = "Error de conexión con el servicio de IA."
        raise HTTPException(status_code=500, detail=detail)

    current_history.append({"role": "assistant", "content": respuesta_limpia})
    session_histories[current_session_id] = current_history[-40:]

    return ChatResponse(respuesta=respuesta_limpia, session_id=current_session_id) # Removed image_received_filename

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)