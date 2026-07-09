from pydantic import BaseModel


class MonthlyData(BaseModel):
    month: str
    value: float


class ActiveProjectSummary(BaseModel):
    id: int
    title: str
    client_name: str
    status: str
    current_phase_description: str | None = None
    deadline: str | None = None


class DashboardSummary(BaseModel):
    total_clients: int
    total_projects: int
    total_budget: float
    completed_budget: float
    projects_by_status: dict[str, int]
    monthly_budget: list[MonthlyData]
    monthly_completed: list[MonthlyData]
    active_projects: list[ActiveProjectSummary]