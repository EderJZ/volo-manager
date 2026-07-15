from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.models.client import Client
from app.models.project import Project
from app.models.project_note import ProjectNote
from app.models.project_phase_date import ProjectPhaseDate
from app.routes import auth, clients, projects, dashboard, users, client_portal, project_notes, project_phases

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Volo Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
app.include_router(project_notes.router)
app.include_router(project_phases.router)


@app.get("/")
def health_check():
    return {"message": "Volo Manager API online"}