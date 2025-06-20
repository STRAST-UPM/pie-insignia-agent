"""
Utility functions for the ISST AI Tutor backend.
"""

import uuid
from typing import Any, Dict, List
from datetime import datetime, timezone


def generate_session_id() -> str:
    """Generate a unique session ID."""
    return str(uuid.uuid4())


def extract_text_from_content(content: Any) -> str:
    """Extract text from various content formats."""
    if isinstance(content, str):
        return content
    
    if isinstance(content, list):
        texts = []
        for item in content:
            if isinstance(item, dict):
                if item.get("type") == "text":
                    texts.append(item.get("text", ""))
                elif "text" in item:
                    texts.append(item["text"])
        return " ".join(texts).strip()
    
    if isinstance(content, dict):
        if content.get("type") == "text":
            return content.get("text", "")
        elif "text" in content:
            return content["text"]
    
    return str(content) if content is not None else ""


def validate_file_type(filename: str, allowed_types: List[str]) -> bool:
    """Validate file type based on extension."""
    if not filename:
        return False
    
    extension = filename.lower().split('.')[-1]
    return extension in allowed_types
