"""
Quick test script to verify both Ollama and OpenRouter providers work
"""
import asyncio
from services import llm_service

async def test_provider(provider: str, model: str):
    print(f"\n{'='*50}")
    print(f"Testing {provider} with model: {model}")
    print('='*50)
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello in one sentence."}
    ]
    
    try:
        response = ""
        async for chunk in llm_service.generate_chat_response_stream(messages, model=model, provider=provider):
            response += chunk
            print(chunk, end="", flush=True)
        
        print(f"\n\n✓ {provider} test successful!")
        return True
    except Exception as e:
        print(f"\n\n✗ {provider} test failed: {e}")
        return False

async def main():
    print("LLM Provider Integration Test")
    print("="*50)
    
    # Test Ollama (if available)
    print("\n1. Testing Ollama...")
    ollama_success = await test_provider("ollama", "deepseek-v3.1:671b-cloud")
    
    # Test OpenRouter (if API key is configured)
    print("\n2. Testing OpenRouter...")
    openrouter_success = await test_provider("openrouter", "deepseek/deepseek-chat")
    
    print("\n" + "="*50)
    print("Test Summary:")
    print(f"  Ollama: {'✓ PASS' if ollama_success else '✗ FAIL'}")
    print(f"  OpenRouter: {'✓ PASS' if openrouter_success else '✗ FAIL'}")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(main())
