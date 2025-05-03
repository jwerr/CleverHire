from flask import Flask, request, jsonify, render_template, send_from_directory, abort
from .resume_parser import extract_text
from .ai_matcher import match_resume
from .storage import save_candidate, get_candidates
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")

# Enable CORS only for frontend
CORS(app, origins=["https://hiresync.netlify.app"])

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_resume():
    file = request.files["resume"]
    job_desc = request.form["job_desc"]

    # Save the uploaded resume securely
    UPLOAD_FOLDER = "uploads"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Extract resume text from saved file
    resume_text = extract_text(file_path)

    # Match score using AI
    score = match_resume(resume_text, job_desc)

    # Save candidate info
    candidate = {
        "name": filename,
        "resume_text": resume_text,
        "match_score": score,
        "status": "Pending"
    }
    save_candidate(candidate)

    return jsonify({"message": "Resume processed successfully.", "score": score})

@app.route('/resume/<path:filename>', methods=["GET"])
def serve_resume(filename):
    uploads_path = os.path.abspath("uploads")
    try:
        return send_from_directory(uploads_path, filename)
    except FileNotFoundError:
        abort(404)

@app.route('/candidates', methods=['GET'])
def get_all_candidates():
    file_path = "./data/candidates.json"
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            json.dump([], f)

    try:
        with open(file_path, "r") as f:
            candidates = json.load(f)
        return jsonify(candidates)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/candidates/status', methods=['POST'])
def update_candidate_status():
    data = request.get_json()
    name = data.get("name")
    new_status = data.get("status")

    file_path = "./data/candidates.json"

    try:
        with open(file_path, "r") as f:
            candidates = json.load(f)

        for candidate in candidates:
            if candidate["name"] == name:
                candidate["status"] = new_status
                break

        with open(file_path, "w") as f:
            json.dump(candidates, f, indent=4)

        return jsonify({"message": f"Status updated to {new_status}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/candidates/<name>', methods=['DELETE'])
def delete_candidate(name):
    file_path = "./data/candidates.json"
    try:
        with open(file_path, "r") as f:
            candidates = json.load(f)

        updated_candidates = [c for c in candidates if c["name"] != name]

        with open(file_path, "w") as f:
            json.dump(updated_candidates, f, indent=4)

        return jsonify({"message": f"Candidate '{name}' deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

from openai import OpenAI
from flask import request, jsonify

client = OpenAI(api_key="your-API-Key")  # replace with your actual key

@app.route("/ai-chat", methods=["POST"])
def ai_chat():
    data = request.json
    user_query = data.get("query", "")

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for hiring and resume review."},
                {"role": "user", "content": user_query}
            ]
        )
        return jsonify({"response": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"response": "Error: " + str(e)})



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
