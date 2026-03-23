import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from bson import ObjectId
from core.database import conversations_collection
from dependencies import get_current_user

router = APIRouter(prefix="/tools", tags=["Tools"])

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return super().default(obj)

@router.get("/export/{conversation_id}")
async def export_conversation(
    conversation_id: str,
    format: str = Query("md", description="Export format: md, txt, or json"),
    current_user: dict = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(conversation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de conversation invalide")
        
    conv = await conversations_collection.find_one({"_id": obj_id, "user_id": current_user["_id"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
        
    title = conv.get("title", "Conversation")
    messages = conv.get("messages", [])
    filename = f"chat_{title.replace(' ', '_').lower()}_{conversation_id}"
    
    if format == "json":
        json_data = json.dumps(conv, cls=JSONEncoder, ensure_ascii=False, indent=2)
        return Response(
            content=json_data,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}.json"'
            }
        )
        
    elif format == "txt":
        content = f"Titre: {title}\n"
        content += "="*50 + "\n\n"
        for msg in messages:
            role = "Vous" if msg["role"] == "user" else "Assistant IA"
            content += f"[{role}] :\n{msg['content']}\n\n"
            content += "-"*50 + "\n\n"
            
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{filename}.txt"'}
        )
        
    elif format == "md":
        content = f"# {title}\n\n"
        for msg in messages:
            role = "**Vous**" if msg["role"] == "user" else "**Assistant IA**"
            content += f"{role}:\n\n{msg['content']}\n\n---\n\n"
            
        return Response(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{filename}.md"'}
        )
        
    else:
        raise HTTPException(status_code=400, detail="Format d'export non supporté (utilisez md, txt ou json)")
