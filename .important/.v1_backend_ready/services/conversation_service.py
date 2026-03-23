from core.database import conversations_collection, agents_collection
from models.conversation import Message
from bson import ObjectId
from datetime import datetime
from core.settings import settings

async def format_messages_for_ollama(conversation_id: str):
    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        return [], settings.DEFAULT_MODEL_NAME
    
    agent = await agents_collection.find_one({"_id": ObjectId(conv["agent_id"])})
    
    messages_for_ollama = []
    if agent and "system_prompt" in agent:
        messages_for_ollama.append({
            "role": "system",
            "content": agent["system_prompt"]
        })
        
    for msg in conv.get("messages", []):
        messages_for_ollama.append({
            "role": msg["role"],
            "content": msg["content"]
        })
        
    return messages_for_ollama, agent.get("model_name", settings.DEFAULT_MODEL_NAME) if agent else settings.DEFAULT_MODEL_NAME

async def add_message_to_conversation(conversation_id: str, role: str, content: str):
    msg_dict = {"role": role, "content": content, "timestamp": datetime.utcnow()}
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$push": {"messages": msg_dict},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    return msg_dict
