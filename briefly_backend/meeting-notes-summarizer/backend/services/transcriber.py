# services/transcriber.py

import os
import uuid
import requests
from fastapi import HTTPException
from config import ASSEMBLYAI_API_KEY

async def upload_and_transcribe(file):
    if file.content_type not in ["audio/mpeg", "audio/wav", "video/mp4", "text/plain"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    # Save the file temporarily
    file_id = str(uuid.uuid4())
    file_path = f"temp/{file_id}_{file.filename}"

    os.makedirs("temp", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write( await file.read())

    # Upload the file to AssemblyAI
    headers = {"authorization": ASSEMBLYAI_API_KEY}
    with open(file_path, "rb") as f:
        upload_response = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers=headers,
            data=f
        )

    if upload_response.status_code != 200:
        os.remove(file_path)  # Clean up the temp file
        raise HTTPException(status_code=500, detail="Failed to upload to AssemblyAI")

    upload_url = upload_response.json()["upload_url"]

    # Request transcription with summarization
    transcript_response = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        json={
            "audio_url": upload_url,
            "summarization": True,
            "summary_model": "informative",
            "summary_type": "bullets"
        },
        headers=headers
    )

    if transcript_response.status_code != 200:
        os.remove(file_path)  # Clean up the temp file
        raise HTTPException(status_code=500, detail="Transcription request failed")

    transcript_id = transcript_response.json()["id"]
    os.remove(file_path)  # Clean up the temp file


    return file_id, transcript_id
