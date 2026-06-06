from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.models.client import Client
from app.routes import auth, clients, projects, dashboard, users, client_portal
from app.models.project import Project

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Volo Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(client_portal.router)

@app.get("/")
def health_check():
    return {"message": "Volo Manager API online"}
