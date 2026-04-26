from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.deps import get_current_user_id
from app.services.supabase import supabase
from app.services.logger import log_interaction
from app.models.enums import ActionType
from app.models import PinnedInterestCreate

router = APIRouter()


@router.post("/pins")
async def create_pin(
    body: PinnedInterestCreate,
    user_id: str = Depends(get_current_user_id),
):
    try:
        record = {
            "id": str(uuid4()),
            "user_id": user_id,
            "description": body.description,
            "is_active": True,
        }
        response = supabase.table("pinned_interests").insert(record).execute()
        pin = response.data[0]
        # Log the interaction
        await log_interaction(user_id, ActionType.pin_added, {"pin_id": pin["id"], "description": pin["description"]})
        
        return pin
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/pins")
async def list_pins(user_id: str = Depends(get_current_user_id)):
    try:
        response = (
            supabase.table("pinned_interests")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/pins/{pin_id}")
async def delete_pin(
    pin_id: str,
    user_id: str = Depends(get_current_user_id),
):
    try:
        response = (
            supabase.table("pinned_interests")
            .update({"is_active": False})
            .eq("id", pin_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pin not found")
            
        # Log the interaction
        await log_interaction(user_id, ActionType.pin_removed, {"pin_id": pin_id})
        
        return {"message": "Pin removed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
