from utils.summarizer import summarize_text
from transformers import pipeline
from utils.summarizer import summarize_text  # Use your existing custom summarizer
import re

# Load once
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", framework="pt")

def categorize_summary(transcript: str) -> dict:
    """
    Categorize transcript into Agenda / Discussion / Decisions.
    """
    labels = ["Agenda", "Discussion", "Decisions"]
    categorized = {label: [] for label in labels}

    sentences = [s.strip() for s in transcript.split(". ") if len(s.strip()) > 10]

    # Step 1: Classify each sentence
    for sentence in sentences:
        result = classifier(sentence, candidate_labels=labels)
        top_label = result["labels"][0]
        categorized[top_label].append(sentence)

    # Step 2: Join sentences under each category
    categorized_text = {label: " ".join(sents) for label, sents in categorized.items()}

    # Step 3: Summarize only if text is lengthy (word > 50 or sentences > 5)
    summarized_output = {}
    for label, text in categorized_text.items():
        word_count = len(text.split())
        sentence_count = len(re.findall(r"[.!?]", text))
        print("For label : ", label)
        print("Word Count : ", word_count)
        print("Sentence Count : ", sentence_count)

        if word_count > 50 or sentence_count > 5:
            try:
                summarized_output[label] = summarize_text(text)
                print("Large categorizor summary works.")
            except Exception as e:
                summarized_output[label] = text  # fallback if summarizer fails
                print("Large category summarizer fails.")
                
        else:
            summarized_output[label] = text

    return summarized_output
