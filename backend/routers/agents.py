import os
import shutil
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException
from typing import List, Optional
from core.database import agents_collection
from models.agent import AgentResponse
from dependencies import get_current_user, get_current_admin_user
from core.settings import settings
from bson import ObjectId

router = APIRouter(prefix="/agents", tags=["Agents"])

# Ensure uploads directory exists
UPLOAD_DIR = "static/logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[AgentResponse])
async def list_agents(current_user: dict = Depends(get_current_user)):
    agents = await agents_collection.find().to_list(100)
    for agent in agents:
        agent["_id"] = str(agent["_id"])
    return agents

@router.post("/", response_model=AgentResponse)
async def create_agent(
    name: str = Form(...),
    description: str = Form(...),
    model_name: Optional[str] = Form(settings.DEFAULT_MODEL_NAME),
    prompt_file: UploadFile = File(..., description="Fichier Markdown .md avec le system prompt"),
    logo_file: Optional[UploadFile] = File(None, description="Image du logo de l'agent"),
    current_user: dict = Depends(get_current_admin_user)
):
    if not prompt_file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Le fichier prompt doit être un .md")
    
    prompt_content = await prompt_file.read()
    system_prompt = prompt_content.decode("utf-8")
    
    logo_url = None
    if logo_file:
        file_extension = os.path.splitext(logo_file.filename)[1]
        safe_filename = f"{name.replace(' ', '_').lower()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(logo_file.file, buffer)
            
        logo_url = f"/static/logos/{safe_filename}"
        
    agent_dict = {
        "name": name,
        "description": description,
        "system_prompt": system_prompt,
        "model_name": model_name,
        "logo_url": logo_url
    }
    
    result = await agents_collection.insert_one(agent_dict)
    agent_dict["_id"] = str(result.inserted_id)
    return agent_dict

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    name: str = Form(...),
    description: str = Form(...),
    model_name: Optional[str] = Form(settings.DEFAULT_MODEL_NAME),
    prompt_file: Optional[UploadFile] = File(None, description="Nouvel optionnel .md avec le system prompt"),
    logo_file: Optional[UploadFile] = File(None, description="Nouvelle image du logo de l'agent"),
    current_user: dict = Depends(get_current_admin_user)
):
    existing_agent = await agents_collection.find_one({"_id": ObjectId(agent_id)})
    if not existing_agent:
        raise HTTPException(status_code=404, detail="Agent non trouvé")
        
    update_data = {
        "name": name,
        "description": description,
        "model_name": model_name
    }
    
    if prompt_file and prompt_file.filename.endswith(".md"):
        prompt_content = await prompt_file.read()
        update_data["system_prompt"] = prompt_content.decode("utf-8")
        
    if logo_file:
        file_extension = os.path.splitext(logo_file.filename)[1]
        safe_filename = f"{name.replace(' ', '_').lower()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(logo_file.file, buffer)
        update_data["logo_url"] = f"/static/logos/{safe_filename}"
        
    await agents_collection.update_one({"_id": ObjectId(agent_id)}, {"$set": update_data})
    
    updated_agent = await agents_collection.find_one({"_id": ObjectId(agent_id)})
    updated_agent["_id"] = str(updated_agent["_id"])
    return updated_agent

@router.delete("/{agent_id}")
async def delete_agent(agent_id: str, current_user: dict = Depends(get_current_admin_user)):
    result = await agents_collection.delete_one({"_id": ObjectId(agent_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agent non trouvé")
    return {"status": "deleted"}
