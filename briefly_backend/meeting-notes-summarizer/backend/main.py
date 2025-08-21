# main.py

import os 
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from sqlmodel import Session, select
from database import get_session
from fastapi.middleware.cors import CORSMiddleware
from services.transcriber import upload_and_transcribe
from services.summarizer import get_transcript_summary
from database import create_db_and_tables
from services.categorizer import categorize_summary
from auth.routes import router as auth_router
from utils.summarizer import summarize_text
from utils.chunker import chunk_summary
from fastapi.responses import JSONResponse
import time
from auth.routes import get_current_user
from fastapi.responses import JSONResponse
from models.user import User
from services.checker import classify_transcript_type

logging.basicConfig(
    level=logging.DEBUG,  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
    format="%(asctime)s - %(levelname)s - %(message)s"
)


app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Include auth routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# Allow frontend to call the backend locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store: file_id → transcript_id
processing_tasks = {}

# In-memory storage for task results
task_results = {}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 1. Upload and transcribe
        file_id, transcript_id = await upload_and_transcribe(file)

        logging.info(f"Uploaded and transcribed file. file_id: {file_id}, transcript_id: {transcript_id}")

        

# Poll AssemblyAI every few seconds until the transcript is ready
        for _ in range(20):  # Max 20 retries (~20s wait)
            summary_data = get_transcript_summary(transcript_id)
            if summary_data.get("status") == "completed":
                break
            logging.info(f"Transcript still processing. Status: {summary_data.get('status')}")
            time.sleep(1)  # Wait 1 second before retrying
        else:
            return JSONResponse(status_code=202, content={"message": "Transcript is still processing. Try again later."})

        # 2. Store the transcript and transcript_id in the processing_tasks dictionary
        processing_tasks[file_id] = {
            "transcript_id": transcript_id,
            "transcript": summary_data.get("transcript", "Transcript not found.")  # Replace with actual transcript text
        }

        # 3. Return the transcript_id to the frontend
        return {"transcript_id": transcript_id}
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/process/{transcript_id}")
async def process_audio(transcript_id: str):
    
    try:
        # Find the transcript
        for task in processing_tasks.values():
            if isinstance(task, dict) and task["transcript_id"] == transcript_id:
                transcript = task["transcript"]
                #print("Transcript : ", transcript)
                break
        else:
            raise ValueError("Transcript not found.")
        print("Transcript : ", transcript)
        # 2. Classify transcript
        transcript_type = classify_transcript_type(transcript)
        print("Transcript type : ", transcript_type)

        if transcript_type == "meeting":
            print("Processing as meeting...")
            # 3. Meeting: Use advanced processing
            categorized_summary = categorize_summary(transcript)
            print("Categorized summary : ", categorized_summary)

            response_data = {
                "type": "meeting",
                "categorized_summary": categorized_summary,
                "transcript": transcript
            }

        else:
            print("Processing as generic transcript...")
            # 2. Summarize transcript using HuggingFace
            summary = summarize_text(transcript)
            # 3. Chunk the summary
            chunked_summary = chunk_summary(summary)
            print("Chuncked summary:", chunked_summary)
        
            # 4. Return both transcript and summary to frontend
            response_data = {
                "type": "generic",
                "summary": chunked_summary,
                "transcript": transcript
                
            }
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    task_results[transcript_id] = response_data
    
    return response_data

@app.get("/me")
def read_current_user(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "tokens_left": user.tokens_left,
        "last_token_used_at": user.created_at  # optional if you want to send this
    }

@app.post("/deduct-token")
def deduct_token(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user.tokens_left <= 0:
        raise HTTPException(status_code=400, detail="No tokens left")

    user.tokens_left -= 1
    session.add(user)
    session.commit()
    return {"message": "Token deducted", "tokens_left": user.tokens_left}

from fastapi.responses import JSONResponse

@app.get("/result/{task_id}")
async def get_result(task_id: str):
    result = task_results.get(task_id)
    if result is None:
        return JSONResponse(content={"status": "processing"}, status_code=202)
    
    print("data :", result)
    return {"status": "completed", "data": result}
