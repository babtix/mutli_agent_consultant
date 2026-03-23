# OpenRouter Integration Guide

This backend now supports both Ollama and OpenRouter as LLM providers.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# LLM Provider Configuration
# Options: "ollama" or "openrouter"
DEFAULT_LLM_PROVIDER="ollama"

# OpenRouter Configuration (only needed if using OpenRouter)
OPENROUTER_API_KEY="your-openrouter-api-key-here"
OPENROUTER_DEFAULT_MODEL="deepseek/deepseek-chat"
OPENROUTER_SITE_URL="http://localhost:5173"
```

### Getting an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Go to your API Keys section
4. Create a new API key
5. Add it to your `.env` file

## Installation

Install the new dependency:

```bash
pip install httpx
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

## Migration

If you have existing agents in your database, run the migration script:

```bash
cd backend
python migrations/add_provider_to_agents.py
```

This will add the `provider` field to all existing agents with the default value.

## Usage

### Creating Agents

When creating an agent, you can now specify the provider:

```json
{
  "name": "My Agent",
  "description": "Agent description",
  "system_prompt": "You are a helpful assistant",
  "model_name": "deepseek/deepseek-chat",
  "provider": "openrouter"
}
```

### Available Models

#### Ollama
- Any model you have pulled locally (e.g., "deepseek-v3.1:671b-cloud")

#### OpenRouter
- `deepseek/deepseek-chat` - DeepSeek Chat
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `anthropic/claude-3-opus` - Claude 3 Opus
- `google/gemini-pro` - Gemini Pro
- And many more - see [OpenRouter Models](https://openrouter.ai/models)

## Architecture

The integration uses a unified LLM service (`llm_service.py`) that routes requests to the appropriate provider:

```
llm_service.py
├── ollama_service.py (local Ollama)
└── openrouter_service.py (OpenRouter API)
```

Each agent stores its preferred provider and model, allowing you to mix and match providers within the same application.

## Benefits

- **Flexibility**: Use local models (Ollama) for privacy and cost savings
- **Access**: Use OpenRouter for models not available locally
- **Scalability**: Switch providers without code changes
- **Cost Control**: Choose the right provider for each use case
