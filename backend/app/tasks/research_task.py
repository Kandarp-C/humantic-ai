import json
import time
import asyncio
from uuid import uuid4

from app.tasks.celery_app import celery
from app.services.supabase import supabase
from app.services.gemini import call_gemini, build_subtopic_prompt, build_research_prompt, build_synthesis_prompt
from app.routers.ws import push_to_user


def _get_topic(topic_id: str) -> dict | None:
    response = supabase.table("research_topics").select("*").eq("id", topic_id).single().execute()
    return response.data


def _get_user_profile(user_id: str) -> dict:
    response = supabase.table("users").select("*").eq("id", user_id).single().execute()
    return response.data or {}


def _get_active_pins(user_id: str) -> list[str]:
    response = (
        supabase.table("pinned_interests")
        .select("description")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )
    return [r["description"] for r in (response.data or [])]


def _update_topic_status(topic_id: str, status: str, cycles_completed: int = 0, error: str | None = None):
    payload = {"status": status, "cycles_completed": cycles_completed}
    if error:
        payload["error_message"] = error
    supabase.table("research_topics").update(payload).eq("id", topic_id).execute()


def _save_findings(findings: list[dict], topic_id: str, user_id: str, cycle: int):
    records = []
    for f in findings:
        records.append({
            "id": str(uuid4()),
            "topic_id": topic_id,
            "user_id": user_id,
            "title": f.get("title", "Untitled"),
            "summary": f.get("summary", ""),
            "full_analysis": f.get("full_analysis", ""),
            "category": f.get("category", "deep_insight"),
            "confidence": f.get("confidence", "medium"),
            "sources": f.get("sources", []),
            "why_this": f.get("why_this", ""),
            "status": "new",
            "cycle_number": cycle,
        })
    if records:
        supabase.table("findings").insert(records).execute()
        for record in records:
            try:
                asyncio.run(push_to_user(user_id, {"type": "new_finding", "data": record}))
            except Exception as e:
                print(f"Failed to push finding to WS: {e}")
    return records


@celery.task(bind=True, max_retries=2, default_retry_delay=30)
def run_research_cycle(self, topic_id: str):
    try:
        topic = _get_topic(topic_id)
        if not topic:
            return

        user_id = topic["user_id"]
        profile = _get_user_profile(user_id)
        pins = _get_active_pins(user_id)
        domain = profile.get("domain", "professional")
        depth = profile.get("depth_preference", "balanced")

        _update_topic_status(topic_id, "researching")

        subtopic_prompt = build_subtopic_prompt(
            topic=topic["topic"],
            goal=topic.get("goal"),
            domain=domain,
            depth=depth,
            pins=pins,
        )
        subtopic_raw = call_gemini(subtopic_prompt)
        subtopics_data = json.loads(subtopic_raw)
        subtopics = subtopics_data.get("subtopics", [])

        raw_results = []
        for item in subtopics[:6]:
            question = item.get("question", "")
            try:
                research_prompt = build_research_prompt(
                    subtopic=question,
                    topic=topic["topic"],
                    domain=domain,
                    depth=depth,
                )
                result = call_gemini(research_prompt)
                raw_results.append({"subtopic": question, "content": result})
                time.sleep(1)
            except Exception:
                continue

        if not raw_results:
            _update_topic_status(topic_id, "failed", error="No research results generated")
            return

        synthesis_prompt = build_synthesis_prompt(
            raw_results=raw_results,
            topic=topic["topic"],
            goal=topic.get("goal"),
            domain=domain,
        )
        synthesis_raw = call_gemini(synthesis_prompt)
        synthesis_data = json.loads(synthesis_raw)
        findings = synthesis_data.get("findings", [])

        saved = _save_findings(findings, topic_id, user_id, cycle=1)
        _update_topic_status(topic_id, "completed", cycles_completed=1)

        return {"topic_id": topic_id, "findings_count": len(saved)}

    except Exception as exc:
        _update_topic_status(topic_id, "failed", error=str(exc))
        raise self.retry(exc=exc)
