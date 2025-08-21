# utils/summarizer.py
import requests
from config import HUGGINGFACE_API_KEY
import time

def split_text(text: str, max_words: int = 400) -> list:
    """Split the input text into chunks of approximately `max_words` words each."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_words):
        chunk = " ".join(words[i:i + max_words])
        chunks.append(chunk)
    return chunks

def summarize_text(text: str) -> str:
    API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

    chunks = split_text(text)
    all_summaries = []

    for idx, chunk in enumerate(chunks):
        try:
            #print(f"Summarizing chunk {idx + 1}/{len(chunks)}...")
            response = requests.post(API_URL, headers=headers, json={"inputs": chunk})
            response.raise_for_status()

            result = response.json()
            if not isinstance(result, list) or 'summary_text' not in result[0]:
                raise ValueError(f"Unexpected response format: {result}")

            all_summaries.append(result[0]['summary_text'])

        except requests.exceptions.RequestException as e:
            raise Exception(f"Error with the Hugging Face API request: {str(e)}")
        except ValueError as e:
            raise Exception(f"Invalid response from Hugging Face API: {str(e)}")

    return "\n\n".join(all_summaries)