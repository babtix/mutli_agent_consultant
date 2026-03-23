# Setup Guide - Multi-Agent Consultant

This guide will help you set up the Multi-Agent Consultant project on your local machine.

## Prerequisites

Before running the setup script, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Ollama** (optional, for local LLM) - [Download Ollama](https://ollama.ai/)

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

Run the automated setup script:

```bash
# Windows
python setup_simple.py

# Linux/Mac
python3 setup_simple.py
```

This script will:
1. Check if Python, Node.js, and npm are installed
2. Install Python backend requirements
3. Install npm dependencies for all frontend projects
4. Create `.env` file from `.env.example`

### Option 2: Manual Setup

If you prefer to set up manually:

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# Update MongoDB connection string, JWT secret, etc.
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Return to root
cd ..
```

## Configuration

### Backend Configuration

Edit `backend/.env` file:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=multi_agent_consultant

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Ollama Configuration (for local LLM)
OLLAMA_BASE_URL=http://localhost:11434

# OpenRouter Configuration (optional, for cloud LLM)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

The frontend is pre-configured to connect to `http://localhost:8000` for the backend API.

If you need to change this, edit `frontend/apps/web/src/lib/api.js`:

```javascript
export const API_BASE_URL = "http://localhost:8000"
```

## Running the Application

### Start Backend

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:5173

### Start MongoDB (if using local instance)

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Start Ollama (if using local LLM)

```bash
# Start Ollama service
ollama serve

# Pull a model (in another terminal)
ollama pull llama2
# or
ollama pull mistral
```

## Project Structure

```
multi_agent_consultant/
├── backend/                 # FastAPI backend
│   ├── core/               # Core configurations
│   ├── models/             # Database models
│   ├── routers/            # API routes
│   ├── services/           # Business logic
│   ├── tools/              # Utility tools
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend (main)
│   ├── apps/web/          # Web application
│   └── packages/ui/       # Shared UI components
├── .frontend1/            # Alternative frontend version
├── .frontend_2/           # Alternative frontend version
├── setup.py               # Setup script (with colors)
├── setup_simple.py        # Setup script (simple)
└── run.py                 # Backend run script
```

## Troubleshooting

### Python Dependencies Issues

If you encounter issues installing Python dependencies:

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies with verbose output
pip install -r backend/requirements.txt -v
```

### Node/npm Issues

If you encounter issues with npm:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `backend/.env`
- Check if port 27017 is available

### Ollama Issues

- Ensure Ollama service is running: `ollama serve`
- Check if models are downloaded: `ollama list`
- Verify Ollama URL in `backend/.env`

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload

# Run tests (if available)
pytest
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/babtix/mutli_agent_consultant/issues)
- Review the documentation
- Contact the development team

## License

This project is part of a university project.
