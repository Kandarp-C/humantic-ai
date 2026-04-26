from typing import Any
from app.services.supabase import supabase
from app.models.enums import ActionType

async def log_interaction(user_id: str, action_type: ActionType, metadata: dict[str, Any] = None):
    """
    Utility to log user interactions to the interaction_logs table.
    This provides the foundation for future Behavioral Pattern Recognition (M7).
    """
    try:
        payload = {
            "user_id": user_id,
            "action_type": action_type.value,
            "metadata": metadata or {}
        }
        supabase.table("interaction_logs").insert(payload).execute()
    except Exception as e:
        # We log and swallow errors here to ensure logging doesn't break the main flow
        print(f"Failed to log interaction: {e}")
