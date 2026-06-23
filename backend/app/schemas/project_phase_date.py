from datetime import date
from pydantic import BaseModel


class ProjectPhaseDateCreate(BaseModel):
    phase: str
    start_date: date | None = None
    end_date: date | None = None


class ProjectPhaseDateUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None


class ProjectPhaseDateResponse(BaseModel):
    id: int
    project_id: int
    phase: str
    start_date: date | None = None
    end_date: date | None = None

    class Config:
        from_attributes = True