from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, agents, conversations
from core.settings import settings

app = FastAPI(title="Multi-IA Consultant API", debug=settings.DEBUG)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(conversations.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Multi-IA Consultant API"}
