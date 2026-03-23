import httpx
from core.settings import settings

async def generate_chat_response_stream(messages: list, model: str = None):
    """
    Generate streaming chat responses using OpenRouter API
    """
    if model is None:
        model = settings.OPENROUTER_DEFAULT_MODEL
    
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OPENROUTER_SITE_URL,
        "X-Title": settings.PROJECT_NAME
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "temperature": settings.MODEL_TEMPERATURE,
        "top_p": settings.MODEL_TOP_P,
        "max_tokens": settings.MODEL_NUM_PREDICT,
    }
    
    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
            async with client.stream(
                "POST",
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        
                        try:
                            import json
                            chunk = json.loads(data)
                            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
                            
    except Exception as e:
        print(f"Error communicating with OpenRouter: {e}")
        raise e
