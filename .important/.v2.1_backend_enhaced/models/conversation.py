from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ConversationBase(BaseModel):
    title: str
    agent_id: str

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: str = Field(alias="_id")
    user_id: str
    messages: List[Message] = []
    created_at: datetime
    updated_at: datetime
