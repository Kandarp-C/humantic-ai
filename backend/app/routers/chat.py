from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from uuid import uuid4
from google import genai
import json

from app.deps import get_current_user_id
from app.services.supabase import supabase
from app.services.chat_analyzer import analyze_for_research_intent
from app.tasks.research_task import run_research_cycle
from app.config import settings
from app.services.gemini import generate_content_with_retry

router = APIRouter()

@router.get("/sessions")
async def list_sessions(user_id: str = Depends(get_current_user_id)):
    response = supabase.table("chat_sessions").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
    return response.data

@router.post("/sessions")
async def create_session(user_id: str = Depends(get_current_user_id)):
    session_id = str(uuid4())
    record = {
        "id": session_id,
        "user_id": user_id,
        "title": "New Chat"
    }
    response = supabase.table("chat_sessions").insert(record).execute()
    return response.data[0]

@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str, user_id: str = Depends(get_current_user_id)):
    # Verify ownership
    session = supabase.table("chat_sessions").select("user_id").eq("id", session_id).single().execute()
    if not session.data or session.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    response = supabase.table("chat_messages").select("*").eq("session_id", session_id).order("created_at").execute()
    return response.data

@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    message: dict,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id)
):
    # 1. Save user message
    user_msg_record = {
        "id": str(uuid4()),
        "session_id": session_id,
        "role": "user",
        "content": message["content"]
    }
    supabase.table("chat_messages").insert(user_msg_record).execute()

    # 2. Get history for Gemini
    history_res = supabase.table("chat_messages").select("role", "content").eq("session_id", session_id).order("created_at").execute()
    history = []
    for m in history_res.data:
        history.append({
            "role": "user" if m["role"] == "user" else "model",
            "parts": [{"text": m["content"]}]
        })

    # 3. Call Gemini
    try:
        response = generate_content_with_retry(
            model="gemini-2.0-flash",
            contents=history,
            config={
                'tools': [{'google_search': {}}]
            }
        )
        ai_content = response.text
    except Exception as e:
        ai_content = f"I encountered an error: {str(e)}"

    # 4. Save AI response
    ai_msg_record = {
        "id": str(uuid4()),
        "session_id": session_id,
        "role": "assistant",
        "content": ai_content
    }
    supabase.table("chat_messages").insert(ai_msg_record).execute()

    # 5. Analyze for research intent in background
    background_tasks.add_task(process_research_intent, history_res.data, user_id)
    background_tasks.add_task(check_and_create_pin_if_pattern, user_id, message["content"])

    return ai_msg_record

async def process_research_intent(messages: list[dict], user_id: str):
    analysis = await analyze_for_research_intent(messages)
    if analysis and analysis.get("research_needed"):
        # Create research topic
        topic_id = str(uuid4())
        record = {
            "id": topic_id,
            "user_id": user_id,
            "topic": analysis["topic"],
            "goal": analysis.get("goal", ""),
            "status": "queued"
        }
        supabase.table("research_topics").insert(record).execute()
        
        # Notify via WebSocket
        from app.routers.ws import push_to_user
        await push_to_user(user_id, {"type": "new_topic", "data": record})
        
        # Trigger Celery
        run_research_cycle.delay(topic_id)
        print(f"Triggered research for topic: {analysis['topic']}")

async def check_and_create_pin_if_pattern(user_id: str, new_message: str):
    """
    Check the last 10 messages from this user across all sessions.
    If the same topic/entity appears 3+ times, auto-create a pin.
    Use Gemini to extract the topic and check for repetition.
    """
    recent_messages = supabase.table("chat_messages")\
        .select("content")\
        .eq("role", "user")\
        .order("created_at", desc=True)\
        .limit(10)\
        .execute()
    
    messages_text = [m["content"] for m in recent_messages.data]
    
    prompt = f"""
    Analyze these recent user messages and determine if there's a recurring topic 
    they keep asking about (appears 3+ times in similar form):
    
    Messages: {messages_text}
    
    If yes, respond with JSON: {{"should_pin": true, "topic": "...", "reason": "..."}}
    If no recurring topic, respond: {{"should_pin": false}}
    
    Only suggest pinning if the topic is clearly recurring and specific (e.g. "NIFTY 50 stocks", 
    "OpenAI competitor news") — not generic queries.
    """
    
    response = generate_content_with_retry(
        model="gemini-2.0-flash",
        contents=prompt,
        config={'response_mime_type': 'application/json'}
    )
    result = json.loads(response.text)
    
    if result.get("should_pin"):
        existing = supabase.table("pinned_interests")\
            .select("id")\
            .eq("user_id", user_id)\
            .ilike("description", f"%{{result['topic'][:20]}}%")\
            .execute()
        
        if not existing.data:
            supabase.table("pinned_interests").insert({{
                "user_id": user_id,
                "description": result["topic"],
                "is_active": True,
                "auto_created": True,
                "auto_reason": result["reason"]
            }}).execute()
            
            from app.routers.ws import push_to_user
            await push_to_user(user_id, {{
                "type": "auto_pin_created",
                "message": f"I noticed you keep asking about {{result['topic']}} — I've added it to your pinned interests and will monitor it for you automatically.",
                "topic": result["topic"]
            }})