from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from core.settings import settings
from dependencies import get_current_admin_user
import os
import ollama

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/models")
async def list_ollama_models(current_user: dict = Depends(get_current_admin_user)):
    """List all available Ollama models from the configured Ollama server."""
    try:
        client = ollama.AsyncClient(host=settings.OLLAMA_URL, timeout=settings.OLLAMA_TIMEOUT)
        response = await client.list()
        models = []
        for model in response.models:
            name = model.model or ""
            size_bytes = model.size or 0
            size_gb = round(size_bytes / (1024 ** 3), 2) if size_bytes else 0
            modified = str(model.modified_at) if model.modified_at else ""
            models.append({
                "name": name,
                "size": size_bytes,
                "size_gb": size_gb,
                "modified_at": modified,
                "is_cloud": "cloud" in name.lower(),
            })
        # Sort: cloud models first, then alphabetical
        models.sort(key=lambda m: (not m["is_cloud"], m["name"]))
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossible de contacter Ollama: {str(e)}")

class SettingsUpdate(BaseModel):
    OLLAMA_URL: Optional[str] = None
    OLLAMA_TIMEOUT: Optional[float] = None
    DEFAULT_MODEL_NAME: Optional[str] = None
    MODEL_TEMPERATURE: Optional[float] = None
    MODEL_TOP_P: Optional[float] = None
    MODEL_TOP_K: Optional[int] = None
    MODEL_REPEAT_PENALTY: Optional[float] = None
    MODEL_NUM_PREDICT: Optional[int] = None
    MODEL_NUM_CTX: Optional[int] = None

@router.get("/")
async def get_settings(current_user: dict = Depends(get_current_admin_user)):
    return {
        "OLLAMA_URL": settings.OLLAMA_URL,
        "OLLAMA_TIMEOUT": settings.OLLAMA_TIMEOUT,
        "DEFAULT_MODEL_NAME": settings.DEFAULT_MODEL_NAME,
        "MODEL_TEMPERATURE": settings.MODEL_TEMPERATURE,
        "MODEL_TOP_P": settings.MODEL_TOP_P,
        "MODEL_TOP_K": settings.MODEL_TOP_K,
        "MODEL_REPEAT_PENALTY": settings.MODEL_REPEAT_PENALTY,
        "MODEL_NUM_PREDICT": settings.MODEL_NUM_PREDICT,
        "MODEL_NUM_CTX": settings.MODEL_NUM_CTX,
    }

@router.put("/")
async def update_settings(update_data: SettingsUpdate, current_user: dict = Depends(get_current_admin_user)):
    data = update_data.model_dump(exclude_unset=True)
    
    # Update active memory
    for key, value in data.items():
        setattr(settings, key, value)
        
    # Write to .env file to persist
    env_lines = []
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            env_lines = f.readlines()
            
    # Build a dictionary of what exists
    env_keys = {}
    for i, line in enumerate(env_lines):
        if "=" in line and not line.strip().startswith("#"):
            k = line.split("=")[0].strip()
            env_keys[k] = i
            
    for key, value in data.items():
        if key in env_keys:
            # Replace existing
            env_lines[env_keys[key]] = f"{key}={value}\n"
        else:
            # Append new
            env_lines.append(f"{key}={value}\n")
            
    with open(".env", "w", encoding="utf-8") as f:
        f.writelines(env_lines)
        
    return {"status": "success", "message": "Settings updated successfully"}
