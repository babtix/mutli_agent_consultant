from core.database import conversations_collection, agents_collection
from bson import ObjectId
from datetime import datetime
from core.settings import settings

async def format_messages_for_llm(conversation_id: str):
    """
    Format messages for LLM and return messages, model name, and provider
    """
    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        return [], settings.DEFAULT_MODEL_NAME, settings.DEFAULT_LLM_PROVIDER
    
    agent = await agents_collection.find_one({"_id": ObjectId(conv["agent_id"])})
    
    messages_for_llm = []
    if agent and "system_prompt" in agent:
        messages_for_llm.append({
            "role": "system",
            "content": agent["system_prompt"]
        })
        
    for msg in conv.get("messages", []):
        messages_for_llm.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    model_name = agent.get("model_name", settings.DEFAULT_MODEL_NAME) if agent else settings.DEFAULT_MODEL_NAME
    provider = agent.get("provider", settings.DEFAULT_LLM_PROVIDER) if agent else settings.DEFAULT_LLM_PROVIDER
        
    return messages_for_llm, model_name, provider

# Keep backward compatibility
async def format_messages_for_ollama(conversation_id: str):
    """Deprecated: Use format_messages_for_llm instead"""
    messages, model_name, _ = await format_messages_for_llm(conversation_id)
    return messages, model_name

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
