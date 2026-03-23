from core.settings import settings
from services import ollama_service, openrouter_service

async def generate_chat_response_stream(messages: list, model: str = None, provider: str = None):
    """
    Unified LLM service that routes to the appropriate provider (Ollama or OpenRouter)
    
    Args:
        messages: List of chat messages
        model: Model name to use
        provider: Provider to use ('ollama' or 'openrouter'). If None, uses default from settings
    """
    if provider is None:
        provider = settings.DEFAULT_LLM_PROVIDER
    
    if provider.lower() == "openrouter":
        async for chunk in openrouter_service.generate_chat_response_stream(messages, model):
            yield chunk
    else:  # Default to ollama
        async for chunk in ollama_service.generate_chat_response_stream(messages, model):
            yield chunk
