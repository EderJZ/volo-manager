from fastapi import APIRouter, Depends
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

ACTIVE_STATUSES = [
    "orcamento", "aprovado", "pre_producao",
    "gravando", "em_edicao", "revisao"
]

FINISHED_STATUSES = ["concluido", "cancelado", "arquivado"]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Clientes ativos
    total_clients = db.query(User).filter(
        User.role == "client",
        User.is_active == True
    ).count()

    # Total de projetos
    total_projects = db.query(Project).count()

    # Orçamento total
    total_budget = db.query(func.sum(Project.budget)).scalar() or 0

    # Orçamento dos projetos concluídos
    completed_budget = db.query(func.sum(Project.budget)).filter(
        Project.status == "concluido"
    ).scalar() or 0

    # Projetos por status
    status_rows = (
        db.query(Project.status, func.count(Project.id))
        .group_by(Project.status)
        .all()
    )
    projects_by_status = {status: count for status, count in status_rows}

    # Orçamento mensal de todos os projetos (últimos 6 meses)
    monthly_budget_rows = (
        db.query(
            func.to_char(Project.start_date, 'MM/YYYY').label("month"),
            func.sum(Project.budget).label("value")
        )
        .filter(Project.start_date.isnot(None))
        .group_by(func.to_char(Project.start_date, 'MM/YYYY'))
        .order_by(func.min(Project.start_date))
        .limit(6)
        .all()
    )
    monthly_budget = [
        {"month": row.month, "value": float(row.value or 0)}
        for row in monthly_budget_rows
    ]

    # Orçamento mensal dos projetos concluídos
    monthly_completed_rows = (
        db.query(
            func.to_char(Project.start_date, 'MM/YYYY').label("month"),
            func.sum(Project.budget).label("value")
        )
        .filter(
            Project.status == "concluido",
            Project.start_date.isnot(None)
        )
        .group_by(func.to_char(Project.start_date, 'MM/YYYY'))
        .order_by(func.min(Project.start_date))
        .limit(6)
        .all()
    )
    monthly_completed = [
        {"month": row.month, "value": float(row.value or 0)}
        for row in monthly_completed_rows
    ]

    # Projetos em andamento
    active_projects_rows = (
        db.query(Project, User)
        .join(User, Project.client_id == User.id)
        .filter(Project.status.in_(ACTIVE_STATUSES))
        .order_by(Project.deadline.asc().nullslast())
        .all()
    )
    active_projects = [
        {
            "id": project.id,
            "title": project.title,
            "client_name": client.name,
            "status": project.status,
            "current_phase_description": project.current_phase_description,
            "deadline": str(project.deadline) if project.deadline else None,
        }
        for project, client in active_projects_rows
    ]

    return {
        "total_clients": total_clients,
        "total_projects": total_projects,
        "total_budget": total_budget,
        "completed_budget": completed_budget,
        "projects_by_status": projects_by_status,
        "monthly_budget": monthly_budget,
        "monthly_completed": monthly_completed,
        "active_projects": active_projects,
    }