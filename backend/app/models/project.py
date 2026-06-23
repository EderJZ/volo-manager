from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="orcamento")
    budget = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)
    current_phase_description = Column(Text, nullable=True)
    has_client_update = Column(Boolean, nullable=False, default=False)

    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client = relationship("User", back_populates="projects")

    notes = relationship("ProjectNote", back_populates="project", cascade="all, delete-orphan")
    phase_dates = relationship("ProjectPhaseDate", back_populates="project", cascade="all, delete-orphan")