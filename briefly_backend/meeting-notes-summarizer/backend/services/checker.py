import re

def classify_transcript_type(transcript: str) -> str:
    """
    Classifies transcript as either 'meeting' or 'non-meeting' using token match probability scoring.
    """

    transcript_lower = transcript.lower()

    # Token lists
    non_meeting_keywords = [
        "podcast", "episode", "host", "guest", "interview", "lecture", "course", "tutorial", "webinar", "training",
        "presentation", "talk", "keynote", "speech", "panel", "discussion", "debate", "lesson", "explanation", "demo",
        "demonstration", "educational", "how to", "walkthrough", "subscribe", "channel", "youtube", "likes", "comment",
        "teaching", "professor", "student", "introduction to", "series", "segment", "recording", "broadcast", "radio",
        "tv", "livestream", "vlog", "behind the scenes", "masterclass", "preview", "review", "recap", "talk show",
        "entertainment", "storytelling", "audiobook", "instructor", "class", "curriculum", "web series"
    ]

    meeting_keywords = [
        "meeting", "agenda", "team", "deadline", "milestone", "minutes", "follow-up", "action item", "client call",
        "status update", "project update", "sprint", "planning", "standup", "daily sync", "weekly call", "brainstorm",
        "check-in", "kick-off", "roadmap", "review meeting", "deliverable", "timeline", "stakeholder", "collaboration",
        "budget", "resource allocation", "assign", "delegate", "project goal", "team discussion", "manager", "scheduling",
        "quarterly review", "KPI", "OKR", "scrum", "task board", "workload", "internal update", "escalation", "team lead",
        "follow through", "documentation", "note-taking", "responsibility", "handover", "project brief", "retro",
        "next steps", "feedback round", "progress report", "task assignment", "action plan", "approval"
    ]

    # Count matches
    meeting_matches = sum(1 for kw in meeting_keywords if kw in transcript_lower)
    non_meeting_matches = sum(1 for kw in non_meeting_keywords if kw in transcript_lower)

    total_matches = meeting_matches + non_meeting_matches

    if total_matches == 0:
        # No indicators found, fallback to keyword-based regex
        if re.search(r"\b(meeting|sync|standup|scrum|agenda)\b", transcript_lower):
            return "meeting"
        return "non-meeting"

    # Calculate probabilities (normalized scores)
    prob_meeting = meeting_matches / total_matches
    prob_non_meeting = non_meeting_matches / total_matches

    # Decision based on higher score
    if prob_meeting >= prob_non_meeting:
        return "meeting"
    else:
        return "non-meeting"
