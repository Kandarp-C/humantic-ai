import json
import time
from uuid import uuid4
from google import genai
from app.tasks.celery_app import celery
from app.services.supabase import supabase
from app.config import settings
from app.models.enums import TopicStatus, FindingCategory, ConfidenceLevel, FindingStatus
from app.services.gemini import generate_content_with_retry

MODEL_NAME = "gemini-2.0-flash"

def _get_topic(topic_id: str):
    res = supabase.table("research_topics").select("*, users(*)").eq("id", topic_id).single().execute()
    return res.data

def _update_topic_status(topic_id: str, status: str, cycles_completed: int = None, error: str = None):
    data = {"status": status}
    if cycles_completed is not None:
        data["cycles_completed"] = cycles_completed
    if error:
        data["error_log"] = error

    try:
        supabase.table("research_topics").update(data).eq("id", topic_id).execute()
    except Exception as e:
        if "error_log" in data and "Could not find the 'error_log' column" in str(e):
            del data["error_log"]
            try:
                supabase.table("research_topics").update(data).eq("id", topic_id).execute()
            except Exception:
                pass
        
    from app.routers.ws import push_to_user
    import asyncio
    
    # Notify frontend of topic status change
    topic = _get_topic(topic_id)
    if topic:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(push_to_user(topic["user_id"], {"type": "topic_updated", "data": topic}))
            else:
                asyncio.run(push_to_user(topic["user_id"], {"type": "topic_updated", "data": topic}))
        except Exception:
            pass

@celery.task(bind=True, max_retries=3)
def run_research_cycle(self, topic_id: str):
    topic = _get_topic(topic_id)
    if not topic:
        return f"Topic {topic_id} not found"

    _update_topic_status(topic_id, "researching")

    try:
        user_profile = topic.get("users", {})
        domain = user_profile.get("domain", "general")
        depth = user_profile.get("depth_preference", "balanced")

        prompt = f"""
You are a research assistant. Research this topic and return ONLY 
valid JSON with no markdown, no backticks, no explanation, no other text.
Just the raw JSON object.

Topic: {topic['topic']}
User domain: {domain}
Goal: {topic.get('goal', 'General exploration')}

Return exactly this JSON structure:
{{
  "findings": [
    {{
      "title": "...",
      "summary": "2-3 sentence summary of this finding",
      "category": "deep_insight",
      "confidence": "high",
      "why_this": "1-2 sentence explanation of why this is relevant to the user",
      "sources": ["Source Name 1", "Source Name 2"]
    }}
  ]
}}

Generate exactly 4 findings. 
Categories must be one of: deep_insight, trend, opportunity, experimental
Use a different category for each finding.
Confidence must be one of: high, medium, speculative.
Return ONLY the JSON. No other text whatsoever.
"""
        time.sleep(2)
        response = generate_content_with_retry(
            model=MODEL_NAME, 
            contents=prompt, 
            config={
                'response_mime_type': 'application/json',
                'tools': [{'google_search': {}}]
            }
        )
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError as e:
            _update_topic_status(topic_id, "failed", error=f"JSON parsing failed. Raw response: {raw_text}")
            return f"Failed to parse JSON for {topic_id}"
        
        findings = []
        for finding_data in data.get("findings", []):
            finding_record = {
                "id": str(uuid4()),
                "topic_id": topic_id,
                "user_id": topic["user_id"],
                "title": finding_data.get("title", "Untitled"),
                "summary": finding_data.get("summary", ""),
                "full_analysis": finding_data.get("full_analysis", ""),
                "category": finding_data.get("category", "deep_insight"),
                "confidence": finding_data.get("confidence", "medium"),
                "sources": [{"url": s, "title": s} if isinstance(s, str) else s for s in finding_data.get("sources", [])],
                "why_this": finding_data.get("why_this", ""),
                "status": "new"
            }
            supabase.table("findings").insert(finding_record).execute()
            findings.append(finding_record)
            
            # Immediately push finding to user via WebSocket
            from app.routers.ws import push_to_user
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(push_to_user(topic["user_id"], {"type": "new_finding", "data": finding_record}))
                else:
                    asyncio.run(push_to_user(topic["user_id"], {"type": "new_finding", "data": finding_record}))
            except Exception:
                pass

        _update_topic_status(topic_id, "completed", cycles_completed=1)
        return f"Research cycle completed for {topic_id}. Generated {len(findings)} findings."

    except Exception as e:
        _update_topic_status(topic_id, "failed", error=str(e))
        return f"Failed {topic_id}: {str(e)}"

@celery.task
def refresh_pinned_interests():
    """
    Runs every 6 hours. For each active pinned interest across all users:
    1. Creates a new research topic record with the pin description as the query
    2. Runs the research pipeline on it (same as run_research_cycle)
    3. Pushes findings via WebSocket to the user
    4. Updates the pin's last_checked_at timestamp
    """
    # Fetch all active pins from Supabase (is_active = true)
    pins = supabase.table("pinned_interests").select("*, users(*)").eq("is_active", True).execute()
    
    from datetime import datetime
    for pin in pins.data:
        # Create a new research topic for this pin
        topic = supabase.table("research_topics").insert({
            "user_id": pin["user_id"],
            "topic": f"[Auto-refresh] {pin['description']}",
            "goal": "Find what's new or changed since last check",
            "status": "pending",
            "source": "pin_refresh",
            "is_auto_refresh": True
        }).execute()
        
        # Run research on it
        run_research_cycle.delay(topic.data[0]["id"])
        
        # Update pin's last checked timestamp
        supabase.table("pinned_interests").update({
            "last_refreshed_at": datetime.utcnow().isoformat()
        }).eq("id", pin["id"]).execute()