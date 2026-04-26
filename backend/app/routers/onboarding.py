from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.deps import get_current_user_id
from app.services.supabase import supabase
from app.services.logger import log_interaction
from app.models.enums import ActionType
from app.models import OnboardingRequest

router = APIRouter()


@router.post("/onboarding")
async def complete_onboarding(
    body: OnboardingRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        response = (
            supabase.table("users")
            .upsert(
                {
                    "id": user_id,
                    "domain": body.answer1,
                    "knowledge_gap": body.answer2,
                    "depth_preference": body.depth_preference,
                    "onboarding_complete": True,
                },
                on_conflict="id",
            )
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save onboarding data",
            )

        # Log the interaction
        await log_interaction(user_id, ActionType.onboarding_complete, {"domain": body.answer1})

        return {"success": True, "message": "Onboarding complete", "user_id": user_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/onboarding/test")
async def onboarding_test(user_id: str = Depends(get_current_user_id)):
    return {"message": "Protected route working", "user_id": user_id}
