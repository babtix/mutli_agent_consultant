import ollama
from core.settings import settings

async def generate_chat_response_stream(messages: list, model: str = None):
    if model is None:
        model = settings.DEFAULT_MODEL_NAME
    client = ollama.AsyncClient(host=settings.OLLAMA_URL, timeout=settings.OLLAMA_TIMEOUT)
    try:
        options = {
            "temperature": settings.MODEL_TEMPERATURE,
            "top_p": settings.MODEL_TOP_P,
            "top_k": settings.MODEL_TOP_K,
            "repeat_penalty": settings.MODEL_REPEAT_PENALTY,
            "num_predict": settings.MODEL_NUM_PREDICT,
            "num_ctx": settings.MODEL_NUM_CTX
        }
        if settings.MODEL_SEED is not None:
            options["seed"] = settings.MODEL_SEED
        if settings.MODEL_STOP:
            options["stop"] = settings.MODEL_STOP
            
        async for chunk in await client.chat(model=model, messages=messages, stream=True, options=options):
            yield chunk.get("message", {}).get("content", "")
    except Exception as e:
        print(f"Error communicating with Ollama: {e}")
        raise e
