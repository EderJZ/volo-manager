from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.client import Client
from app.models.project import Project
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_clients = db.query(Client).count()
    total_projects = db.query(Project).count()

    total_budget = db.query(func.sum(Project.budget)).scalar() or 0

    status_rows = (
        db.query(Project.status, func.count(Project.id))
        .group_by(Project.status)
        .all()
    )

    projects_by_status = {
        status: count for status, count in status_rows
    }

    return {
        "total_clients": total_clients,
        "total_projects": total_projects,
        "total_budget": total_budget,
        "projects_by_status": projects_by_status
    }