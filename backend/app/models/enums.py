from enum import Enum


class UserDomain(str, Enum):
    consultant = "consultant"
    analyst = "analyst"
    product_manager = "product_manager"
    researcher = "researcher"
    other = "other"


class ResearchDepth(str, Enum):
    quick_summaries = "quick_summaries"
    balanced = "balanced"
    deep_dives = "deep_dives"


class TopicStatus(str, Enum):
    queued = "queued"
    researching = "researching"
    completed = "completed"
    failed = "failed"


class FindingCategory(str, Enum):
    deep_insight = "deep_insight"
    trend = "trend"
    opportunity = "opportunity"
    experimental = "experimental"


class FindingStatus(str, Enum):
    new = "new"
    approved = "approved"
    dismissed = "dismissed"


class ConfidenceLevel(str, Enum):
    high = "high"
    medium = "medium"
    speculative = "speculative"


class ActionType(str, Enum):
    research_submitted = "research_submitted"
    finding_viewed = "finding_viewed"
    finding_approved = "finding_approved"
    finding_dismissed = "finding_dismissed"
    pin_added = "pin_added"
    pin_removed = "pin_removed"
    followup_asked = "followup_asked"
