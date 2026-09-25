import json
import httpx
from typing import Dict, Any, Optional
from ..config import settings

SYSTEM_INSTRUCTION = """You are an objective revenue intelligence auditor analyzing real sales conversation transcripts.
You must adhere strictly to these non-negotiable rules:
1. Use only supplied evidence from the transcript and explicit metadata.
2. Do not invent customer information, company names, deal size/value, or pipeline stages not directly stated in the text.
3. Do not invent account relationships or organizational hierarchies.
4. Do not assume a salesperson identity from an organizer field.
5. Do not assume action item ownership unless the conversation specifically establishes who agreed to do it.
6. Do not treat missing transcript as proof that no conversation happened.
7. If evidence is insufficient for any point, explicitly state it in 'not_established'.
8. Quote only short, exact supplied passages from the transcript.
9. Identify transcript turn numbers (e.g. 14) wherever turns are numbered. For phone calls without turn numbers, use turn: null and quote the exact sentence.
10. Allowed routing categories: ['customer_follow_up', 'deal_next_steps', 'sales_coaching', 'internal_vendor_note', 'needs_human_review'].
11. If multiple routes are justified by the evidence, return all applicable routes.
12. If human judgment is needed or evidence is ambiguous, mark review_required=true and include 'needs_human_review' in suggested_routes.

You must respond ONLY with a valid JSON object matching this schema:
{
  "summary": "Concise factual summary of what happened in the interaction",
  "why_it_matters": "Business significance based solely on facts mentioned",
  "evidence": [
    {
      "turn": 14,
      "quote": "short exact transcript quote",
      "reason": "why this supports the conclusion"
    }
  ],
  "not_established": [
    "Explicit statement of what is NOT proven by the interaction"
  ],
  "recommended_actions": [
    {
      "action": "Specific concrete action",
      "owner": "Specific named person if verified, or null"
    }
  ],
  "suggested_routes": [
    "customer_follow_up"
  ],
  "review_required": false
}
"""

async def analyze_with_gemini(
    source_type: str,
    source_id: str,
    record_ref: Optional[str],
    metadata: Dict[str, Any],
    transcript_text: str,
    turns: Optional[list] = None
) -> Optional[Dict[str, Any]]:
    if not settings.GEMINI_API_KEY:
        return None

    # Construct the user prompt
    prompt_content = f"""SOURCE RECORD:
Type: {source_type}
ID: {source_id}
Reference: {record_ref or 'N/A'}
Metadata: {json.dumps(metadata, default=str)}

TRANSCRIPT:
{transcript_text}

Analyze this interaction according to the system instructions. Output only the JSON object."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt_content}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                print(f"[Gemini Error] HTTP {response.status_code}: {response.text}")
                return None

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return None

            content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if not content_text:
                return None

            parsed = json.loads(content_text)
            return parsed
    except Exception as e:
        print(f"[Gemini Exception] {str(e)}")
        return None
