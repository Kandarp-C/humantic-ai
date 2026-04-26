import google.genai as genai
from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)
MODEL = "gemini-2.5-flash"


def call_gemini(prompt: str) -> str:
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    print(f"DEBUG: Gemini Response Object: {response}")
    
    text = ""
    try:
        text = response.text
    except Exception:
        pass
        
    if (not text or text == "") and response.candidates:
        try:
            parts = response.candidates[0].content.parts
            text = "".join([p.text for p in parts if hasattr(p, "text") and p.text])
        except (AttributeError, IndexError):
            pass

    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:].strip()
    elif text.startswith("```"):
        text = text[3:].strip()
    
    if text.endswith("```"):
        text = text[:-3].strip()
        
    return text


def build_subtopic_prompt(topic: str, goal: str | None, domain: str, depth: str, pins: list[str]) -> str:
    pins_text = "\n".join(f"- {p}" for p in pins) if pins else "None"
    return f"""You are a research assistant for a {domain} professional.

Research topic: "{topic}"
Goal: "{goal or 'Not specified'}"
Depth preference: {depth}

Pinned interests (give these extra weight):
{pins_text}

Break this topic into 5-8 focused, searchable subtopics.
Return ONLY valid JSON in this exact format:
{{"subtopics": [{{"question": "...", "rationale": "..."}}]}}"""


def build_research_prompt(subtopic: str, topic: str, domain: str, depth: str) -> str:
    return f"""You are a research assistant for a {domain} professional.

Main topic: "{topic}"
Research this specific subtopic: "{subtopic}"
Depth preference: {depth}

Provide a thorough research response. Cite specific facts, trends, companies, and data points.
Return ONLY valid JSON:
{{"findings": [{{"title": "...", "summary": "...", "full_analysis": "...", "category": "deep_insight|trend|opportunity|experimental", "confidence": "high|medium|speculative", "sources": [{{"url": "...", "title": "...", "snippet": "..."}}], "why_this": "..."}}]}}"""


def build_synthesis_prompt(raw_results: list[dict], topic: str, goal: str | None, domain: str) -> str:
    results_text = "\n\n".join(
        f"Subtopic: {r['subtopic']}\nFindings: {r['content']}" for r in raw_results
    )
    return f"""You are a senior research analyst for a {domain} professional.

Topic: "{topic}"
Goal: "{goal or 'General research'}"

Here are raw research results from multiple subtopics:
{results_text}

Synthesize these into 5-10 high-quality findings. Remove duplicates, elevate the most important insights.
Return ONLY valid JSON:
{{"findings": [{{"title": "...", "summary": "...", "full_analysis": "...", "category": "deep_insight|trend|opportunity|experimental", "confidence": "high|medium|speculative", "sources": [{{"url": "...", "title": "...", "snippet": "..."}}], "why_this": "..."}}]}}"""
