"""
schemas.py — Pydantic v2 request/response models for Humantic AI.

All models use Pydantic v2 syntax:
  - model_config = ConfigDict(...) replaces class Config
  - Field(default=None) for optional fields
  - model_validator / field_validator decorators

Naming convention:
  *Create  → request body for POST endpoints
  *Update  → request body for PATCH endpoints
  *Response → response body returned to the client
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import (
    ActionType,
    ConfidenceLevel,
    FindingCategory,
    FindingStatus,
    ResearchDepth,
    TopicStatus,
    UserDomain,
)


# ─────────────────────────────────────────────
# USER / PROFILE
# ─────────────────────────────────────────────

class UserProfile(BaseModel):
    """Public profile returned to the client after auth/onboarding."""

    model_config = ConfigDict(from_attributes=True)

    id:                  UUID
    display_name:        Optional[str]         = None
    domain:              Optional[UserDomain]  = None
    current_focus:       Optional[str]         = None
    knowledge_gap:       Optional[str]         = None
    depth_preference:    Optional[ResearchDepth] = None
    weekly_hours:        Optional[int]         = None
    onboarding_complete: bool                  = False
    created_at:          datetime


class UserProfileUpdate(BaseModel):
    """Partial update to a user's profile (PATCH /api/users/me)."""

    display_name:        Optional[str]           = None
    domain:              Optional[UserDomain]     = None
    current_focus:       Optional[str]            = None
    knowledge_gap:       Optional[str]            = None
    depth_preference:    Optional[ResearchDepth]  = None
    weekly_hours:        Optional[int]            = Field(default=None, ge=0, le=168)


# ─────────────────────────────────────────────
# ONBOARDING
# ─────────────────────────────────────────────

class OnboardingRequest(BaseModel):
    """
    The three answers collected during the onboarding wizard.
    answer1 → current_focus (what are you working on?)
    answer2 → knowledge_gap (what's your biggest gap?)
    depth_preference → quick_summaries | deep_dives | balanced
    """

    answer1:          str          = Field(..., min_length=3, max_length=1000,
                                         description="What are you working on right now?")
    answer2:          str          = Field(..., min_length=3, max_length=1000,
                                         description="What is your biggest knowledge gap?")
    depth_preference: ResearchDepth = Field(...,
                                           description="Preferred research output depth")


class OnboardingResponse(BaseModel):
    """Returned after the backend processes the onboarding answers."""

    profile:          UserProfile
    message:          str = "Onboarding complete. Your research companion is ready."


# ─────────────────────────────────────────────
# RESEARCH TOPICS
# ─────────────────────────────────────────────

class ResearchTopicCreate(BaseModel):
    """
    Request body for POST /api/research.
    The user writes in plain language — no special syntax required.
    """

    topic: str  = Field(..., min_length=5, max_length=2000,
                        description="Plain-language research question or topic")
    goal:  Optional[str] = Field(default=None, max_length=1000,
                                 description="Optional: what the user hopes to achieve")


class ResearchTopicResponse(BaseModel):
    """Full representation of a research topic returned to the client."""

    model_config = ConfigDict(from_attributes=True)

    id:               UUID
    user_id:          UUID
    topic:            str
    goal:             Optional[str]  = None
    status:           TopicStatus
    cycles_completed: int            = 0
    max_cycles:       int            = 1
    error_message:    Optional[str]  = None
    created_at:       datetime
    updated_at:       datetime


class ResearchTopicList(BaseModel):
    """Paginated list response for GET /api/research."""

    topics: list[ResearchTopicResponse]
    total:  int


# ─────────────────────────────────────────────
# FINDINGS
# ─────────────────────────────────────────────

class SourceItem(BaseModel):
    """A single source citation attached to a finding."""

    url:     str
    title:   Optional[str] = None
    snippet: Optional[str] = None


class FindingResponse(BaseModel):
    """
    Full representation of a research finding returned to the client.
    Written by the backend service role (Celery task); read by the user.
    """

    model_config = ConfigDict(from_attributes=True)

    id:            UUID
    topic_id:      UUID
    user_id:       UUID
    title:         str
    summary:       str
    full_analysis: Optional[str]            = None
    category:      FindingCategory
    confidence:    ConfidenceLevel
    sources:       list[SourceItem]         = Field(default_factory=list)
    why_this:      str
    status:        FindingStatus            = FindingStatus.new
    cycle_number:  int                      = 1
    created_at:    datetime

    @field_validator("sources", mode="before")
    @classmethod
    def coerce_sources(cls, v: Any) -> list[dict]:
        """Accept raw JSONB list from Supabase (list of dicts)."""
        if v is None:
            return []
        return v


class FindingStatusUpdate(BaseModel):
    """
    Request body for PATCH /api/findings/{id}.
    Only status can be changed by the user (approve or dismiss).
    """

    status: FindingStatus = Field(
        ...,
        description="Must be 'approved' or 'dismissed'",
    )

    @field_validator("status")
    @classmethod
    def must_be_review_action(cls, v: FindingStatus) -> FindingStatus:
        if v == FindingStatus.new:
            raise ValueError("Cannot set status back to 'new'")
        return v


class FindingList(BaseModel):
    """Paginated list response for GET /api/findings."""

    findings: list[FindingResponse]
    total:    int


# ─────────────────────────────────────────────
# PINNED INTERESTS
# ─────────────────────────────────────────────

class PinnedInterestCreate(BaseModel):
    """Request body for POST /api/pins."""

    description: str = Field(..., min_length=5, max_length=500,
                             description="Plain-language description of what to monitor")


class PinnedInterestResponse(BaseModel):
    """Full representation of a pinned interest."""

    model_config = ConfigDict(from_attributes=True)

    id:           UUID
    user_id:      UUID
    description:  str
    is_active:    bool
    last_checked: Optional[datetime] = None
    created_at:   datetime


class PinnedInterestList(BaseModel):
    """List response for GET /api/pins."""

    pins:  list[PinnedInterestResponse]
    total: int


# ─────────────────────────────────────────────
# INTERACTION LOGS (M7 foundation — internal use)
# ─────────────────────────────────────────────

class InteractionLogCreate(BaseModel):
    """
    Written by the backend whenever the user takes a meaningful action.
    Never exposed directly to the client via a public endpoint.
    """

    action_type: ActionType
    metadata:    dict[str, Any] = Field(default_factory=dict,
                                        description="Free-form payload (topic_id, finding_id, etc.)")


# ─────────────────────────────────────────────
# GENERIC RESPONSES
# ─────────────────────────────────────────────

class MessageResponse(BaseModel):
    """Generic success message for endpoints with no payload to return."""

    message: str


class ErrorResponse(BaseModel):
    """Standard error envelope."""

    detail: str
    code:   Optional[str] = None
