from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from docx import Document
from dotenv import load_dotenv
from google import genai
import io
import os
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Reworked backend is alive!"}


def extract_text(filename: str, content: bytes) -> str:
    extension = filename.lower().split(".")[-1]

    if extension == "txt":
        return content.decode("utf-8", errors="replace")

    if extension == "pdf":
        reader = PdfReader(io.BytesIO(content))
        pages = []

        for page in reader.pages:
            pages.append(page.extract_text() or "")

        return "\n".join(pages)

    if extension == "docx":
        document = Document(io.BytesIO(content))
        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        )

    raise ValueError("Unsupported file type")


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename or ""

    if not filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    extension = filename.lower().split(".")[-1]

    if extension not in {"txt", "pdf", "docx"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT files are currently supported",
        )

    content = await file.read()

    try:
        text = extract_text(filename, content)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read file: {error}",
        )

    return {
        "filename": filename,
        "content_type": file.content_type,
        "message": "File received and text extracted successfully!",
        "text": text,
    }
@app.post("/generate-questions")
async def generate_questions(data: dict):
    text = data.get("text", "").strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No text was provided"
        )

    prompt = f"""
You are the question-generation system for an educational game called Reworked.

Read the study material below and identify the questions or testable concepts contained in it.

Return ONLY valid JSON in exactly this format:

{{
  "questions": [
    {{
      "question": "The question text",
      "answer": "The correct answer",
      "type": "short_answer",
      "choices": []
    }}
  ]
}}

Rules:
- Extract questions from the supplied material.
- If the material contains questions, preserve their meaning.
- If it contains study notes rather than explicit questions, create reasonable questions from the information actually present.
- Do not invent facts that are not supported by the material.
- Every question MUST be multiple choice.
- Every question MUST have exactly 4 possible answers in "choices".
- Put the correct answer in the "answer" field.
- Do not generate short-answer questions.
- Return ONLY JSON. No markdown. No explanation.

STUDY MATERIAL:
{text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )

        raw_text = response.text.strip()

        return {
            "questions": raw_text
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini request failed: {error}"
        )