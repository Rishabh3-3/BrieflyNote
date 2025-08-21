# services/summarizer.py

import requests
from fastapi import HTTPException
from config import ASSEMBLYAI_API_KEY

def get_transcript_summary(transcript_id: str):
    headers = {"authorization": ASSEMBLYAI_API_KEY}
    response = requests.get(f"https://api.assemblyai.com/v2/transcript/{transcript_id}", headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch transcript summary.")

    data = response.json()

    if data["status"] == "completed":
        return {
            "status": "completed",
            "summary": data.get("summary", "No summary found."),
            "transcript": data.get("text", "No transcript found.")
        }
    elif data["status"] == "processing":
        return {"status": "processing"}
    else:
        return {"status": "error", "message": data.get("error", "Unknown error")}
