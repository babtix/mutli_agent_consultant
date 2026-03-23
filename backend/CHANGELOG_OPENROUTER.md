# OpenRouter Integration Changelog

## Summary
Added OpenRouter support alongside existing Ollama integration, allowing the backend to use either local Ollama models or cloud-based models via OpenRouter API.

## Files Created

1. **backend/services/openrouter_service.py**
   - New service for OpenRouter API integration
   - Handles streaming chat responses from OpenRouter
   - Supports all OpenRouter models

2. **backend/services/llm_service.py**
   - Unified LLM service that routes to appropriate provider
   - Abstracts provider selection logic
   - Maintains consistent interface for both providers

3. **backend/migrations/add_provider_to_agents.py**
   - Migration script to add provider field to existing agents
   - Run once after deployment

4. **backend/OPENROUTER_SETUP.md**
   - Complete setup and usage guide
   - Configuration instructions
   - Model recommendations

5. **backend/test_providers.py**
   - Test script to verify both providers work
   - Useful for debugging and validation

## Files Modified

1. **backend/core/settings.py**
   - Added `DEFAULT_LLM_PROVIDER` setting
   - Added OpenRouter configuration variables:
     - `OPENROUTER_API_KEY`
     - `OPENROUTER_DEFAULT_MODEL`
     - `OPENROUTER_SITE_URL`
   - Reorganized settings for clarity

2. **backend/.env.example**
   - Added OpenRouter configuration examples
   - Updated documentation

3. **backend/models/agent.py**
   - Added `provider` field to AgentBase model
   - Defaults to `DEFAULT_LLM_PROVIDER` from settings

4. **backend/services/conversation_service.py**
   - Added `format_messages_for_llm()` function
   - Returns messages, model, and provider
   - Kept `format_messages_for_ollama()` for backward compatibility

5. **backend/routers/conversations.py**
   - Updated imports to use `llm_service`
   - Modified chat endpoint to use provider-aware service
   - Improved error handling

6. **backend/requirements.txt**
   - Added `httpx` dependency for OpenRouter API calls

## Breaking Changes
None - fully backward compatible. Existing agents will default to Ollama.

## Migration Steps

1. Install new dependency:
   ```bash
   pip install httpx
   ```

2. Update `.env` file with OpenRouter settings (optional):
   ```env
   DEFAULT_LLM_PROVIDER="ollama"
   OPENROUTER_API_KEY="your-key-here"
   OPENROUTER_DEFAULT_MODEL="deepseek/deepseek-chat"
   ```

3. Run migration for existing agents:
   ```bash
   python backend/migrations/add_provider_to_agents.py
   ```

4. Test the integration:
   ```bash
   python backend/test_providers.py
   ```

## Usage Examples

### Create an Ollama Agent
```json
{
  "name": "Local Assistant",
  "description": "Uses local Ollama",
  "system_prompt": "You are helpful",
  "model_name": "deepseek-v3.1:671b-cloud",
  "provider": "ollama"
}
```

### Create an OpenRouter Agent
```json
{
  "name": "Cloud Assistant",
  "description": "Uses OpenRouter",
  "system_prompt": "You are helpful",
  "model_name": "deepseek/deepseek-chat",
  "provider": "openrouter"
}
```

## Benefits

- **Flexibility**: Mix local and cloud models in the same app
- **No Breaking Changes**: Existing functionality preserved
- **Easy Configuration**: Simple environment variables
- **Provider Agnostic**: Unified interface for all LLMs
- **Scalable**: Easy to add more providers in the future
