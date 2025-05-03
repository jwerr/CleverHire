import cohere
import re
from dotenv import load_dotenv
import os

load_dotenv()
# Load API key securely
COHERE_API_KEY = os.getenv("MY_API_KEY")
co = cohere.Client(COHERE_API_KEY)

def match_resume(resume_text, job_desc):
    prompt = f"""
    Given the following resume and job description, analyze and provide a match score based on:
    - Skills match
    - Experience relevance
    - Education fit
    - Overall suitability

    Format response strictly as JSON:
    {{
      "match_score": <score between 1 and 100>,
      "reasoning": "<brief explanation>"
    }}

    Resume: 
    {resume_text}

    Job Description:
    {job_desc}
    """

    response = co.generate(
        model="command",
        prompt=prompt,
        max_tokens=100,  # More space for reasoning
        temperature=0.2  # Lower temp for consistent outputs
    )

    # Extract JSON response
    try:
        # Use regex to extract the match_score value
        match = re.search(r'"match_score":\s*(\d+)', response.generations[0].text)
        if match:
            match_score = int(match.group(1))
            print("Extracted Match Score:", match_score)
            print("Cohere raw response:", response.generations[0].text)

        else:
            print("Match score not found in response. Defaulting to 50.")
            match_score = 50  # Fallback to 50 if match_score is not found
    except Exception as e:
        print("Error extracting match score:", e)
        match_score = 50  # Fallback to 50 if an error occurs

    return match_score

