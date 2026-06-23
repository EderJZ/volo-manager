from datetime import datetime
from pydantic import BaseModel


class ProjectNoteCreate(BaseModel):
    content: str
    type: str = "internal"


class ProjectNoteUpdate(BaseModel):
    content: str


class ProjectNoteResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    content: str
    type: str
    created_at: datetime
    updated_at: datetime | None = None
    user_name: str | None = None

    class Config:
        from_attributes = True