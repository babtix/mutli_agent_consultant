# Multi-Agent Consultant

AI consultant platform with multiple specialized agents. Built with FastAPI, React, MongoDB, and Ollama.

## Quick Setup

### 1. Install Dependencies

```bash
python setup_simple.py
```

### 2. Configure

Edit `backend/.env`:
```env
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Run

**Backend:**
```bash
python run.py
```
→ http://localhost:8000

**Frontend:**
```bash
cd frontend
npm run dev
```
→ http://localhost:5173

## Requirements

- Python 3.8+
- Node.js 16+
- MongoDB
- Ollama (optional)

## Features

- Multiple AI agents with custom roles
- Real-time streaming responses
- PDF/DOCX upload support
- Export conversations (Markdown, JSON, Text)
- Local (Ollama) or Cloud (OpenRouter) LLM support

## Tech Stack

**Backend:** FastAPI, MongoDB, Ollama  
**Frontend:** React, Vite, Tailwind CSS, Shadcn/ui

## Documentation

- API Docs: http://localhost:8000/docs
- Detailed Setup: [SETUP.md](SETUP.md)

---

University Project
