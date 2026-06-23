from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants import PROJECT_PHASES, PROJECT_SPECIAL_STATUSES, get_next_phase, get_previous_phase
from app.database import get_db
from app.models.project import Project
from app.models.project_phase_date import ProjectPhaseDate
from app.models.user import User
from app.schemas.project_phase_date import ProjectPhaseDateResponse, ProjectPhaseDateUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/projects/{project_id}/phases", tags=["Project Phases"])


def require_admin_or_editor(current_user: User):
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores e editores podem mover fases."
        )


def get_project_or_404(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado."
        )
    return project


@router.post("/advance")
def advance_phase(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin_or_editor(current_user)
    project = get_project_or_404(project_id, db)

    if project.status in PROJECT_SPECIAL_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projetos cancelados ou arquivados não podem mudar de fase."
        )

    if project.status == "concluido":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projeto já está concluído."
        )

    next_phase = get_next_phase(project.status)
    if not next_phase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projeto já está na última fase."
        )

    project.status = next_phase
    project.has_client_update = True
    db.commit()

    return {"status": project.status, "message": f"Projeto avançado para '{next_phase}'."}


@router.post("/retreat")
def retreat_phase(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin_or_editor(current_user)
    project = get_project_or_404(project_id, db)

    if project.status in PROJECT_SPECIAL_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projetos cancelados ou arquivados não podem mudar de fase."
        )

    if project.status == "concluido":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projetos concluídos não podem voltar de fase."
        )

    previous_phase = get_previous_phase(project.status)
    if not previous_phase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projeto já está na primeira fase."
        )

    project.status = previous_phase
    db.commit()

    return {"status": project.status, "message": f"Projeto voltou para '{previous_phase}'."}


@router.post("/cancel")
def cancel_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin_or_editor(current_user)
    project = get_project_or_404(project_id, db)

    if project.status == "concluido":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Projetos concluídos não podem ser cancelados."
        )

    project.status = "cancelado"
    project.has_client_update = True
    db.commit()

    return {"status": "cancelado", "message": "Projeto cancelado."}


@router.post("/archive")
def archive_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin_or_editor(current_user)
    project = get_project_or_404(project_id, db)

    project.status = "arquivado"
    db.commit()

    return {"status": "arquivado", "message": "Projeto arquivado."}


@router.post("/restore")
def restore_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin_or_editor(current_user)
    project = get_project_or_404(project_id, db)

    if project.status != "arquivado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas projetos arquivados podem ser restaurados."
        )

    project.status = "orcamento"
    db.commit()

    return {"status": "orcamento", "message": "Projeto restaurado para orçamento."}


@router.get("/dates", response_model=list[ProjectPhaseDateResponse])
def get_phase_dates(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_project_or_404(project_id, db)
    return db.query(ProjectPhaseDate).filter(
        ProjectPhaseDate.project_id == project_id
    ).all()


@router.put("/dates/{phase}", response_model=ProjectPhaseDateResponse)
def update_phase_date(
    project_id: int,
    phase: str,
    date_data: ProjectPhaseDateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin_or_editor(current_user)
    get_project_or_404(project_id, db)

    phase_date = db.query(ProjectPhaseDate).filter(
        ProjectPhaseDate.project_id == project_id,
        ProjectPhaseDate.phase == phase
    ).first()

    if not phase_date:
        phase_date = ProjectPhaseDate(
            project_id=project_id,
            phase=phase,
            start_date=date_data.start_date,
            end_date=date_data.end_date,
        )
        db.add(phase_date)
    else:
        phase_date.start_date = date_data.start_date
        phase_date.end_date = date_data.end_date

    db.commit()
    db.refresh(phase_date)
    return phase_date