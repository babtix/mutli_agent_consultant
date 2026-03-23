from pydantic import BaseModel, Field
from core.settings import settings

class AgentBase(BaseModel):
    name: str
    description: str
    system_prompt: str
    model_name: str = settings.DEFAULT_MODEL_NAME

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: str = Field(alias="_id")
