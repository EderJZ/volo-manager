from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/client-portal", tags=["Client Portal"])


@router.get("/me")
def get_my_info(
    current_user: User = Depends(get_current_user)
):
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