from datetime import date
from pydantic import BaseModel


class ProjectBase(BaseModel):
    title: str
    description: str | None = None
    status: str = "orcamento"
    budget: float | None = None
    start_date: date | None = None
    deadline: date | None = None
    client_id: int


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int

    class Config:
        from_attributes = True