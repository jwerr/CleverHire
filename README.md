# CleverHire - Resume Filtering Platform

CleverHire is a powerful recruitment platform designed to help recruiters filter out resumes based on a matching score calculated using Cohere AI.
The platform analyzes the job description (JD) and checks for relevant keywords present in the resume, generating a match score to identify the most suitable candidates.

---

## Features

* AI-based Resume Matching using Cohere API
* Real-time match score calculation
* Candidate management with applied date and score
* Dashboard displaying highest score and candidate count
* Status-based donut chart with Chart.js
* Resume parsing for PDF and DOCX files
* OpenAI-powered AI Assistant Chat

---

## Tech Stack

### **Frontend:**

* HTML, CSS, JavaScript
* Fetch API for communication with backend
* Local storage for state management
* Chart.js for visualizations

### **Backend:**

* Python (Flask framework)
* Cohere API for AI-based text analysis
* OpenAI API for AI assistant
* PDF and DOCX parsing (pdfplumber and docx)
* JSON-based data storage

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/jwerr/CleverHire.git
```

2. **Navigate to the project directory**

```bash
cd CleverHire
```

3. **Create a virtual environment**

```bash
python -m venv venv
```

4. **Activate the virtual environment**

* For Windows:

```bash
venv\Scripts\activate
```

* For Linux/Mac:

```bash
source venv/bin/activate
```

5. **Install dependencies**

```bash
pip install -r requirements.txt
```

6. **Set up environment variables (if preferred)**
   Create a `.env` file in the root directory and add the following:

```
COHERE_API_KEY=your-cohere-api-key
OPENAI_API_KEY=your-openai-api-key
APP_SECRET_KEY=your-secret-key
```

> **Alternatively**, if you're not using a `.env` file, you can directly include the OpenAI key in your code (for local testing only):

```python
from openai import OpenAI
client = OpenAI(api_key="your-openai-api-key")
```

7. **Run the application**

```bash
python wsgi.py
```

---

## Usage

1. Upload the resume file (PDF or DOCX) using the file upload section.
2. Provide the job description (JD) in the input field.
3. Click on the "Upload" button to process the resume.
4. The system will analyze the resume using Cohere AI and generate a match score.
5. The candidate information (name, score, and applied date) will be saved in the candidate list.
6. The dashboard will display:

   * Total number of candidates
   * Highest match score
   * Status-based distribution chart
   * Latest application date & average score
7. Recruiters can view or delete candidate information directly from the table.

---

## OpenAI API Integration (for AI Assistant)

This section enables the AI Assistant chat feature powered by OpenAI's GPT model.

### 1. Get Your OpenAI API Key

* Visit [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
* Log in and generate a new API key

### 2. Add Key to Code or `.env`

#### Option A: Environment File (Recommended)

```env
OPENAI_API_KEY=your-api-key-here
```

#### Option B: Hardcoded (for quick testing only)

```python
from openai import OpenAI
client = OpenAI(api_key="your-openai-api-key")
```

### 3. How It Works

* The `/ai-chat` Flask route sends your question to OpenAI’s GPT (e.g., `gpt-3.5-turbo`)
* Returns a contextual response to power your in-app AI assistant

### 4. Requirements

Make sure `openai` is included in your `requirements.txt`:

```
openai>=1.0.0
```

Install it manually if not:

```bash
pip install openai
```

### 5. Test It

Ask a question using the assistant on the frontend (bottom-right chat bubble).
You should see an intelligent reply generated from your query.

---

## API Integration

* Cohere API is used to analyze the resume and JD text.
* The system checks the presence of JD keywords in the resume and calculates a match score.
* This allows recruiters to efficiently filter out the most suitable candidates.

---
## Future Enhancements

* Candidate trend line chart
* Export candidate data as CSV
* Notification triggers for high matches
* Cloud-based deployment (Render, Vercel, etc.)

---

## Credits

Created by Shivayokeshwari
Inspired by the need for smarter, fairer, faster hiring decisions.
