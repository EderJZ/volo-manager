from datetime import date
from pydantic import BaseModel, model_validator
from app.schemas.project_note import ProjectNoteResponse
from app.schemas.project_phase_date import ProjectPhaseDateResponse


class ProjectBase(BaseModel):
    title: str
    description: str | None = None
    status: str = "orcamento"
    budget: float | None = None
    start_date: date | None = None
    deadline: date | None = None
    client_id: int
    current_phase_description: str | None = None


class ProjectCreate(ProjectBase):

    @model_validator(mode="after")
    def validate_deadline(self):
        if self.start_date and self.deadline and self.deadline < self.start_date:
            raise ValueError("A data de entrega não pode ser anterior à data de início.")
        return self


class ProjectUpdate(ProjectBase):

    @model_validator(mode="after")
    def validate_deadline(self):
        if self.start_date and self.deadline and self.deadline < self.start_date:
            raise ValueError("A data de entrega não pode ser anterior à data de início.")
        return self


class ProjectResponse(ProjectBase):
    id: int
    has_client_update: bool = False
    notes: list[ProjectNoteResponse] = []
    phase_dates: list[ProjectPhaseDateResponse] = []
    client_name: str | None = None

    class Config:
        from_attributes = True