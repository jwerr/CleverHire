import json
from datetime import datetime

DATA_FILE = "data/candidates.json"

def save_candidate(candidate):
    """
    Save a candidate to the JSON file.
    The candidate should be a dictionary with at least "name" and "match_score" keys.
    """
    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    
    # Add the current date as the "applied_on" field (optional)
    candidate["applied_on"] = datetime.now().strftime("%Y-%m-%d")
    
    data.append(candidate)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_candidates():
    """
    Retrieve the list of candidates from the JSON file.
    Returns a list of dictionaries with "name", "match_score", and "applied_on" keys.
    """
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []