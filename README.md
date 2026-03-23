# Multi-Agent Consultant

A modern, full-stack AI consultant platform that allows you to interact with multiple specialized AI agents. Built with FastAPI, React, MongoDB, and powered by Ollama or OpenRouter.

![Multi-Agent Consultant](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![Node](https://img.shields.io/badge/node-16+-green.svg)
![License](https://img.shields.io/badge/license-University%20Project-orange.svg)

## Features

- **Multi-Agent IA** - Consult multiple specialized AI agents, each with their own role and expertise
- **100% Local & Secure** - Your data stays on your servers, no data sent to third-party services
- **Real-time Responses** - Live streaming of responses for a fluid chat experience
- **Upload & Export** - Import PDF and DOCX files, export conversations in Markdown, text, or JSON
- **Powered by Ollama** - Use any Ollama-compatible model: LLaMA, Mistral, DeepSeek, and more
- **Open Source** - Open code, extensible and customizable for your business needs
- **OpenRouter Support** - Optional cloud-based LLM support via OpenRouter API

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Ollama** - Local LLM inference
- **OpenRouter** - Cloud LLM API (optional)
- **JWT** - Authentication
- **Python 3.8+**

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons
- **React Router** - Navigation

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB
- Ollama (optional, for local LLM)

### Automated Setup

Run the setup script to install all dependencies:

```bash
# Windows
python setup_simple.py

# Linux/Mac
python3 setup_simple.py
```

This will:
1. Check prerequisites (Python, Node.js, npm)
2. Install backend Python requirements
3. Install frontend npm dependencies
4. Create environment configuration file

### Manual Setup

See [SETUP.md](SETUP.md) for detailed manual setup instructions.

## Running the Application

### Start Backend

```bash
# Using the run script
python run.py

# Or directly with uvicorn
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend API: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173

### Start MongoDB

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Start Ollama (Optional)

```bash
# Start Ollama service
ollama serve

# Pull a model
ollama pull llama2
```

## Project Structure

```
multi_agent_consultant/
├── backend/                 # FastAPI backend
│   ├── core/               # Core configurations (database, security, settings)
│   ├── models/             # Database models (User, Agent, Conversation)
│   ├── routers/            # API routes (auth, agents, conversations, settings)
│   ├── services/           # Business logic (LLM, Ollama, OpenRouter)
│   ├── tools/              # Utility tools (PDF reader, DOCX reader, export)
│   ├── static/             # Static files (agent logos)
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend (main version)
│   ├── apps/web/          # Web application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts (Auth, Theme)
│   │   │   ├── pages/       # Page components
│   │   │   └── lib/         # Utilities and API client
│   │   └── package.json
│   └── packages/ui/       # Shared UI components (shadcn/ui)
├── setup.py               # Automated setup script (with colors)
├── setup_simple.py        # Automated setup script (simple)
├── run.py                 # Backend run script
├── SETUP.md              # Detailed setup guide
└── README.md             # This file
```

## Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=multi_agent_consultant

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Ollama (local LLM)
OLLAMA_BASE_URL=http://localhost:11434

# OpenRouter (cloud LLM - optional)
OPENROUTER_API_KEY=your-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

The frontend connects to `http://localhost:8000` by default.

To change this, edit `frontend/apps/web/src/lib/api.js`:

```javascript
export const API_BASE_URL = "http://localhost:8000"
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Features in Detail

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt
- Admin role support

### Agent Management
- Create custom AI agents with specific roles and instructions
- Upload custom agent logos
- Configure agent parameters (temperature, max tokens)
- Support for both Ollama and OpenRouter models

### Conversations
- Real-time streaming responses
- Upload PDF and DOCX files for context
- Export conversations in multiple formats (Markdown, JSON, Text)
- Conversation history and management
- Multi-turn conversations with context

### Settings (Admin)
- Configure default LLM provider (Ollama/OpenRouter)
- Manage API keys
- System configuration

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload

# Run tests
pytest

# Format code
black .
```

### Frontend Development

```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

### Backend Deployment

1. Set up a production MongoDB instance
2. Configure environment variables
3. Use a production WSGI server (e.g., Gunicorn)
4. Set up reverse proxy (e.g., Nginx)

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

## Troubleshooting

See [SETUP.md](SETUP.md) for common issues and solutions.

## Contributing

This is a university project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is part of a university project.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Ollama](https://ollama.ai/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [OpenRouter](https://openrouter.ai/)

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/babtix/mutli_agent_consultant/issues)
- Check the [SETUP.md](SETUP.md) documentation

---

Made with ❤️ for university project
