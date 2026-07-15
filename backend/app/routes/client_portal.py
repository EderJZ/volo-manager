from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.project_note import ProjectNote
from app.models.user import User
from app.schemas.project import ProjectResponse
from app.services.auth import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/client-portal", tags=["Client Portal"])


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.get("/me")
def get_my_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "company": current_user.company,
    }


@router.get("/my-projects", response_model=list[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Project).filter(
        Project.client_id == current_user.id
    ).order_by(Project.id.desc()).all()


@router.get("/my-projects/{project_id}/notes")
def get_project_notes(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.client_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado."
        )

    notes = db.query(ProjectNote).filter(
        ProjectNote.project_id == project_id,
        ProjectNote.type == "client"
    ).order_by(ProjectNote.created_at.desc()).all()

    return [
        {
            "id": note.id,
            "content": note.content,
            "created_at": note.created_at,
            "user_name": note.user.name if note.user else None,
        }
        for note in notes
    ]


@router.post("/mark-read/{project_id}")
def mark_project_read(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.client_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado."
        )

    project.has_client_update = False
    db.commit()
    return {"message": "Marcado como lido."}


@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta."
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 6 caracteres."
        )

    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Senha alterada com sucesso."}