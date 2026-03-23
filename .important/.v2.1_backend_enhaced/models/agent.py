from pydantic import BaseModel, Field
from core.settings import settings
from typing import Optional

class AgentBase(BaseModel):
    name: str
    description: str
    system_prompt: str
    model_name: str = settings.DEFAULT_MODEL_NAME
    logo_url: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: str = Field(alias="_id")
