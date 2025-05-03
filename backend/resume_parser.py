import pdfplumber
from docx import Document

def extract_text(file_path):
    if file_path.endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join(para.text for para in doc.paragraphs)
    else:
        return "Unsupported file format"
