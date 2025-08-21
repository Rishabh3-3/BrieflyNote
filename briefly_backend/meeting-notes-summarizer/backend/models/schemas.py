from pydantic import BaseModel

class TranscriptInput(BaseModel):
    text: str

class SummaryResponse(BaseModel):
    summary: str
    source: str


