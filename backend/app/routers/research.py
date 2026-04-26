from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.deps import get_current_user_id
from app.services.supabase import supabase
from app.services.logger import log_interaction
from app.models.enums import ActionType
from app.models import ResearchTopicCreate
from app.tasks.research_task import run_research_cycle

router = APIRouter()


@router.post("/research")
async def create_research(
    body: ResearchTopicCreate,
    user_id: str = Depends(get_current_user_id),
):
    try:
        record = {
            "id": str(uuid4()),
            "user_id": user_id,
            "topic": body.topic,
            "goal": body.goal,
            "status": "queued",
            "cycles_completed": 0,
        }
        response = supabase.table("research_topics").insert(record).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create research topic",
            )

        topic = response.data[0]
        run_research_cycle.delay(str(topic["id"]))
        
        # Log the interaction
        await log_interaction(user_id, ActionType.research_submitted, {"topic_id": topic["id"], "topic": topic["topic"]})
        
        return topic

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/research")
async def list_research(user_id: str = Depends(get_current_user_id)):
    try:
        response = (
            supabase.table("research_topics")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
