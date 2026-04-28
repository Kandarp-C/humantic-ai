import json
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

async def analyze_for_research_intent(messages: list[dict]) -> dict | None:
    """
    Analyzes the conversation history to determine if the user has an implicit or explicit research request.
    Returns a dict with 'research_needed', 'topic', and 'goal' if true, else None.
    """
    conversation_text = "\n".join([
        f"{m['role']}: {m['content']}" for m in messages[-5:] # Look at last 5 messages
    ])

    prompt = f"""
    You are an intent analyzer for Humantic AI, an autonomous research assistant.
    Analyze the following conversation and determine if the user is asking for research, information gathering, or deep analysis.

    Conversation:
    {conversation_text}

    Output ONLY a JSON object with the following schema:
    {{
        "research_needed": boolean,
        "topic": "the specific research topic string (omit if research_needed is false)",
        "goal": "the specific research goal or question (omit if research_needed is false)"
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                'response_mime_type': 'application/json'
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"ERROR in chat_analyzer: {e}")
        return None