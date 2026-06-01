from fastapi import FastAPI

from app.database import Base, engine
from app.models.user import User
from app.models.client import Client
from app.routes import auth, clients

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Volo Manager API")

app.include_router(auth.router)
app.include_router(clients.router)

@app.get("/")
def health_check():
    return {"message": "Volo Manager API online"}

