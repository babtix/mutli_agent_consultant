from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from typing import List
from core.database import conversations_collection, agents_collection
from models.conversation import ConversationCreate, ConversationResponse
from dependencies import get_current_user
from services.conversation_service import format_messages_for_llm, add_message_to_conversation
from services import llm_service
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class ChatRequest(BaseModel):
    message: str

class ConversationRename(BaseModel):
    title: str

@router.get("/search/", response_model=List[ConversationResponse])
async def search_conversations(
    q: str = Query("", min_length=1, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Search conversations by title or message content"""
    filter_query = {
        "user_id": current_user["_id"],
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"messages.content": {"$regex": q, "$options": "i"}},
        ]
    }
    conversations = await conversations_collection.find(filter_query)\
        .sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    return conversations

@router.post("/", response_model=ConversationResponse)
async def create_conversation(conv_in: ConversationCreate, current_user: dict = Depends(get_current_user)):
    agent = await agents_collection.find_one({"_id": ObjectId(conv_in.agent_id)})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    conv_dict = conv_in.model_dump()
    conv_dict["user_id"] = current_user["_id"]
    conv_dict["messages"] = []
    conv_dict["created_at"] = datetime.utcnow()
    conv_dict["updated_at"] = datetime.utcnow()
    
    result = await conversations_collection.insert_one(conv_dict)
    conv_dict["_id"] = str(result.inserted_id)
    return conv_dict

@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    conversations = await conversations_collection.find(
        {"user_id": current_user["_id"]}
    ).sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    return conversations

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id), "user_id": current_user["_id"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv["_id"] = str(conv["_id"])
    return conv

@router.put("/{conversation_id}", response_model=ConversationResponse)
async def rename_conversation(
    conversation_id: str, 
    rename_data: ConversationRename, 
    current_user: dict = Depends(get_current_user)
):
    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id), "user_id": current_user["_id"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"title": rename_data.title, "updated_at": datetime.utcnow()}}
    )
    
    conv["title"] = rename_data.title
    conv["_id"] = str(conv["_id"])
    return conv

@router.post("/{conversation_id}/chat")
async def chat(conversation_id: str, request_data: ChatRequest, req: Request, current_user: dict = Depends(get_current_user)):
    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id), "user_id": current_user["_id"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Save user message
    await add_message_to_conversation(conversation_id, "user", request_data.message)
    
    # Get all messages formatted for LLM with provider info
    messages_for_llm, model_name, provider = await format_messages_for_llm(conversation_id)
    
    async def stream_generator():
        full_response = ""
        try:
            async for text_chunk in llm_service.generate_chat_response_stream(messages_for_llm, model=model_name, provider=provider):
                # Detect if the front-end canceled the HTTP connection
                if await req.is_disconnected():
                    print("Client disconnected, stopping generation...")
                    break
                    
                full_response += text_chunk
                yield text_chunk
                
        except Exception as e:
            print(f"Error during chat generation: {e}")
            if not full_response.strip():
                yield f"Error: {str(e)}"
        finally:
            # We save whatever was generated up to the moment of cancellation
            if full_response.strip():
                await add_message_to_conversation(conversation_id, "assistant", full_response)

    return StreamingResponse(stream_generator(), media_type="text/plain")

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    result = await conversations_collection.delete_one({"_id": ObjectId(conversation_id), "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted"}
