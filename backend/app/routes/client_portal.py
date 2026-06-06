from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.client import Client
from app.models.project import Project
from app.schemas.project import ProjectResponse
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/client-portal", tags=["Client Portal"])


@router.get("/me")
def get_my_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.email == current_user.email).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum cliente vinculado a este usuário."
        )

    return {
        "id": client.id,
        "name": client.name,
        "email": client.email,
        "phone": client.phone,
        "company": client.company,
    }


@router.get("/my-projects", response_model=list[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.email == current_user.email).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum cliente vinculado a este usuário."
        )

    projects = db.query(Project).filter(
        Project.client_id == client.id
    ).order_by(Project.id.desc()).all()

    return projects