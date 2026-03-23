from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, agents, conversations
from tools import export_tool, pdf_reader_tool, docx_reader_tool
from core.settings import settings
from core.database import init_db
from fastapi.staticfiles import StaticFiles
import os

os.makedirs("static/logos", exist_ok=True)

app = FastAPI(title="Multi-IA Consultant API", debug=settings.DEBUG)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup_event():
    await init_db()

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
app.include_router(export_tool.router)
app.include_router(pdf_reader_tool.router)
app.include_router(docx_reader_tool.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Multi-IA Consultant API"}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8008, reload=True)
