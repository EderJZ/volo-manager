from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.project_note import ProjectNote
from app.models.user import User
from app.schemas.project_note import ProjectNoteCreate, ProjectNoteResponse, ProjectNoteUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/projects/{project_id}/notes", tags=["Project Notes"])


def get_project_or_404(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado."
        )
    return project


@router.get("/", response_model=list[ProjectNoteResponse])
def list_notes(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_project_or_404(project_id, db)
    notes = db.query(ProjectNote).filter(
        ProjectNote.project_id == project_id
    ).order_by(ProjectNote.created_at.desc()).all()

    result = []
    for note in notes:
        note_dict = {
            "id": note.id,
            "project_id": note.project_id,
            "user_id": note.user_id,
            "content": note.content,
            "type": note.type,
            "created_at": note.created_at,
            "updated_at": note.updated_at,
            "user_name": note.user.name if note.user else None,
        }
        result.append(note_dict)
    return result


@router.post("/", response_model=ProjectNoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    project_id: int,
    note_data: ProjectNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)

    if note_data.type not in ["internal", "client"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de anotação inválido. Use 'internal' ou 'client'."
        )

    note = ProjectNote(
        project_id=project_id,
        user_id=current_user.id,
        content=note_data.content,
        type=note_data.type,
    )
    db.add(note)

    if note_data.type == "client":
        project.has_client_update = True

    db.commit()
    db.refresh(note)

    return {
        "id": note.id,
        "project_id": note.project_id,
        "user_id": note.user_id,
        "content": note.content,
        "type": note.type,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "user_name": current_user.name,
    }


@router.put("/{note_id}", response_model=ProjectNoteResponse)
def update_note(
    project_id: int,
    note_id: int,
    note_data: ProjectNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_project_or_404(project_id, db)

    note = db.query(ProjectNote).filter(
        ProjectNote.id == note_id,
        ProjectNote.project_id == project_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada."
        )

    if note.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode editar suas próprias anotações."
        )

    note.content = note_data.content
    note.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(note)

    return {
        "id": note.id,
        "project_id": note.project_id,
        "user_id": note.user_id,
        "content": note.content,
        "type": note.type,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "user_name": note.user.name if note.user else None,
    }


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    project_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_project_or_404(project_id, db)

    note = db.query(ProjectNote).filter(
        ProjectNote.id == note_id,
        ProjectNote.project_id == project_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada."
        )

    if note.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode deletar suas próprias anotações."
        )

    db.delete(note)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)