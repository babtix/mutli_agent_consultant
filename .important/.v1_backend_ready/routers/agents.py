from fastapi import APIRouter, Depends
from typing import List
from core.database import agents_collection
from models.agent import AgentCreate, AgentResponse
from dependencies import get_current_user

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/", response_model=List[AgentResponse])
async def list_agents(current_user: dict = Depends(get_current_user)):
    agents = await agents_collection.find().to_list(100)
    for agent in agents:
        agent["_id"] = str(agent["_id"])
    return agents

@router.post("/", response_model=AgentResponse)
async def create_agent(agent: AgentCreate, current_user: dict = Depends(get_current_user)):
    agent_dict = agent.model_dump()
    result = await agents_collection.insert_one(agent_dict)
    agent_dict["_id"] = str(result.inserted_id)
    return agent_dict
