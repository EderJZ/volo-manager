from sqlalchemy import Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class ProjectPhaseDate(Base):
    __tablename__ = "project_phase_dates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    phase = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    project = relationship("Project", back_populates="phase_dates")

    __table_args__ = (
        UniqueConstraint("project_id", "phase", name="uq_project_phase"),
    )