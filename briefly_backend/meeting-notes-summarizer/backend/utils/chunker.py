# # utils/chunker.py

from typing import List

import requests  # for making HTTP requests to the Hugging Face API
from config import HUGGINGFACE_API_KEY  # assuming your API key is stored in config.py

# Fallback chunker (basic but reliable)
def chunk_summary(summary: str, max_chars: int = 400) -> List[str]:
    import re

    sentences = re.split(r'(?<=[.!?]) +', summary)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chars:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks
