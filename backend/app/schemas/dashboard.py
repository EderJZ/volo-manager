from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_clients: int
    total_projects: int
    total_budget: float
    projects_by_status: dict[str, int]