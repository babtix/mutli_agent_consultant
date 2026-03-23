from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-IA Consultant"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "multiia_db"
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_TIMEOUT: float = 120.0
    DEFAULT_MODEL_NAME: str = "deepseek-v3.1:671b-cloud"
    MODEL_TEMPERATURE: float = 0.7
    MODEL_TOP_P: float = 0.9
    MODEL_TOP_K: int = 40
    MODEL_REPEAT_PENALTY: float = 1.1
    MODEL_NUM_PREDICT: int = 1024 
    MODEL_NUM_CTX: int = 4096 
    MODEL_SEED: int | None = None     
    #or 42 for max (Utile pour forcer l'IA à reproduire exactement la même réponse pour une même question)    
    MODEL_STOP: list[str] = []   
    #Une liste de mots ou caractères (list[str]) qui ordonnera au modèle de stopper sa génération instantanément s'il les prononce. Utile si l'IA s'égare.          
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
 

    class Config:
        env_file = ".env"

settings = Settings()
