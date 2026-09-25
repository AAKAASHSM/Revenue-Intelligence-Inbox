from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, Text,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from .database import Base

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(50), nullable=False, index=True)  # 'call' or 'meeting'
    source_id = Column(String(255), nullable=False, index=True)
    record_ref = Column(String(50), nullable=True, index=True)   # e.g. 'C01', 'M07'
    person = Column(String(255), nullable=True, index=True)       # Rep name or organizer email
    date = Column(String(20), nullable=True, index=True)          # YYYY-MM-DD
    started_at = Column(String(50), nullable=True)               # ISO string
    duration_seconds = Column(Float, default=0.0)
    status = Column(String(100), default="active")
    transcript_available = Column(Boolean, default=False, index=True)
    applied_revision = Column(Integer, default=1)
    metadata_json = Column(Text, nullable=True)                   # Full raw payload
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("source_type", "source_id", name="uq_source_type_source_id"),
        Index("ix_source_composite", "source_type", "source_id"),
    )

    # Relationships
    transcript = relationship("Transcript", back_populates="record", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="record", cascade="all, delete-orphan", order_by="desc(Analysis.id)")
    routes = relationship("Route", back_populates="record", cascade="all, delete-orphan")
    manual_decisions = relationship("ManualDecision", back_populates="record", cascade="all, delete-orphan", order_by="desc(ManualDecision.id)")


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    content = Column(Text, nullable=True)                         # Plaintext or formatted turns
    turns_json = Column(Text, nullable=True)                      # JSON list of turns {turn: int, speaker: str, timecode: str, text: str}
    unavailable_reason = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    received_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("Record", back_populates="transcript")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_json = Column(Text, nullable=False)                  # Strict JSON object
    analysis_version = Column(Integer, default=1)
    generated_by = Column(String(50), default="pre-generated")    # 'ai' | 'pre-generated' | 'manager'
    source_revision = Column(Integer, default=1)
    status = Column(String(50), default="current")                # 'current' | 'needs_review' | 'stale' | 'unavailable'
    generated_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("Record", back_populates="analyses")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), nullable=False, index=True)
    route = Column(String(100), nullable=False)                   # e.g. customer_follow_up, sales_coaching, etc.
    source = Column(String(50), default="ai_suggested")           # 'ai_suggested' | 'manager_decision'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    record = relationship("Record", back_populates="routes")


class ManualDecision(Base):
    __tablename__ = "manual_decisions"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), nullable=False, index=True)
    original_route = Column(String(100), nullable=True)
    manual_route = Column(String(100), nullable=False)
    corrected_by = Column(String(100), default="Manager")
    reason = Column(Text, nullable=True)
    corrected_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("Record", back_populates="manual_decisions")


class ImportRun(Base):
    __tablename__ = "import_runs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(100), nullable=False)
    batch_type = Column(String(50), nullable=False)               # 'initial' | 'update' | 'replay'
    revision = Column(Integer, default=1)
    records_processed = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    duplicates_prevented = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    details_json = Column(Text, nullable=True)
