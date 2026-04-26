from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.deps import get_current_user_id
from app.services.supabase import supabase
from app.services.logger import log_interaction
from app.models.enums import ActionType
from app.models import FindingStatusUpdate

router = APIRouter()


@router.get("/findings")
async def list_findings(
    topic_id: str | None = None,
    category: str | None = None,
    user_id: str = Depends(get_current_user_id),
):
    try:
        query = supabase.table("findings").select("*").eq("user_id", user_id)
        if topic_id:
            query = query.eq("topic_id", topic_id)
        if category:
            query = query.eq("category", category)
        response = query.order("created_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/findings/{finding_id}")
async def get_finding(
    finding_id: str,
    user_id: str = Depends(get_current_user_id),
):
    try:
        response = (
            supabase.table("findings")
            .select("*")
            .eq("id", finding_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/findings/{finding_id}")
async def update_finding_status(
    finding_id: str,
    body: FindingStatusUpdate,
    user_id: str = Depends(get_current_user_id),
):
    if body.status not in ("approved", "dismissed"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'approved' or 'dismissed'")
    try:
        response = (
            supabase.table("findings")
            .update({"status": body.status})
            .eq("id", finding_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
        
        finding = response.data[0]
        # Log the interaction
        action = ActionType.finding_approved if body.status == "approved" else ActionType.finding_dismissed
        await log_interaction(user_id, action, {"finding_id": finding_id, "topic_id": finding.get("topic_id")})
        
        return finding
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
