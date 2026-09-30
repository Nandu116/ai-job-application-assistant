
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from dotenv import load_dotenv
from google import genai

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    Text,
    DateTime,
    inspect,
    text
)
from sqlalchemy.orm import declarative_base, sessionmaker

from datetime import datetime

import io
import os
import re


# --------------------------------------------------
# Environment Variables
# --------------------------------------------------

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# --------------------------------------------------
# FastAPI
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Database
# --------------------------------------------------

DATABASE_URL = "sqlite:///./applications.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# --------------------------------------------------
# Application Model
# --------------------------------------------------

class Application(Base):

    __tablename__ = "applications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    resume_text = Column(
        Text
    )

    job_description = Column(
        Text
    )

    match_percentage = Column(
        Integer
    )

    matched_skills = Column(
        Text
    )

    missing_skills = Column(
        Text
    )

    ai_analysis = Column(
        Text
    )

    status = Column(
        Text,
        default="Applied"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# --------------------------------------------------
# Create Tables
# --------------------------------------------------

Base.metadata.create_all(
    bind=engine
)


# --------------------------------------------------
# Database Migration
# --------------------------------------------------

inspector = inspect(engine)

columns = [
    column["name"]
    for column in inspector.get_columns(
        "applications"
    )
]

if "status" not in columns:

    with engine.begin() as connection:

        connection.execute(
            text(
                "ALTER TABLE applications "
                "ADD COLUMN status TEXT "
                "DEFAULT 'Applied'"
            )
        )


# --------------------------------------------------
# Test Endpoint
# --------------------------------------------------

@app.get("/hello")
def hello():

    return {
        "message":
            "Backend is working"
    }


# --------------------------------------------------
# Upload Resume
# --------------------------------------------------

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    contents = await file.read()

    reader = PdfReader(
        io.BytesIO(contents)
    )

    text_content = ""

    for page in reader.pages:

        text_content += (
            page.extract_text()
            or ""
        )

    return {
        "filename": file.filename,
        "text": text_content
    }


# --------------------------------------------------
# Skill Dictionary
# --------------------------------------------------

SKILL_ALIASES = {

    "python": [
        "python"
    ],

    "javascript": [
        "javascript",
        "js"
    ],

    "typescript": [
        "typescript",
        "ts"
    ],

    "react": [
        "react",
        "reactjs",
        "react.js"
    ],

    "node.js": [
        "node.js",
        "nodejs",
        "node"
    ],

    "express.js": [
        "express",
        "express.js",
        "expressjs"
    ],

    "fastapi": [
        "fastapi",
        "fast api"
    ],

    "rest api": [
        "rest api",
        "rest apis",
        "restful api",
        "restful apis"
    ],

    "sql": [
        "sql"
    ],

    "mysql": [
        "mysql"
    ],

    "postgresql": [
        "postgresql",
        "postgres"
    ],

    "mongodb": [
        "mongodb",
        "mongo db"
    ],

    "html": [
        "html",
        "html5"
    ],

    "css": [
        "css",
        "css3"
    ],

    "git": [
        "git"
    ],

    "github": [
        "github"
    ],

    "java": [
        "java"
    ],

    "c++": [
        "c++"
    ],

    "c": [
        "c programming",
        " c "
    ],

    "machine learning": [
        "machine learning",
        "machine-learning",
        "ml"
    ],

    "deep learning": [
        "deep learning",
        "deep-learning"
    ],

    "generative ai": [
        "generative ai",
        "genai",
        "gen ai"
    ],

    "llm": [
        "llm",
        "llms",
        "large language model",
        "large language models"
    ],

    "docker": [
        "docker"
    ],

    "kubernetes": [
        "kubernetes",
        "k8s"
    ],

    "aws": [
        "aws",
        "amazon web services"
    ],

    "azure": [
        "azure"
    ],

    "django": [
        "django"
    ],

    "flask": [
        "flask"
    ],

    "angular": [
        "angular"
    ],

    "vue": [
        "vue",
        "vue.js"
    ],

    "bootstrap": [
        "bootstrap"
    ],

    "tailwind": [
        "tailwind",
        "tailwind css"
    ],

    "redis": [
        "redis"
    ],

    "graphql": [
        "graphql"
    ],

    "data structures": [
        "data structures",
        "data structure",
        "dsa"
    ],

    "algorithms": [
        "algorithms",
        "algorithm"
    ],

    "oop": [
        "object oriented programming",
        "object-oriented programming",
        "oops",
        "oop"
    ],

    "linux": [
        "linux"
    ],

    "tensorflow": [
        "tensorflow"
    ],

    "pytorch": [
        "pytorch"
    ],

    "pandas": [
        "pandas"
    ],

    "numpy": [
        "numpy"
    ]

}


# --------------------------------------------------
# Normalize Text
# --------------------------------------------------

def normalize_text(text_value):

    text_value = text_value.lower()

    text_value = re.sub(
        r"\s+",
        " ",
        text_value
    )

    return text_value


# --------------------------------------------------
# Check Whether Skill Exists
# --------------------------------------------------

def skill_exists(
    text_value,
    aliases
):

    normalized = normalize_text(
        text_value
    )

    for alias in aliases:

        alias_normalized = normalize_text(
            alias
        )

        # Special handling for short
        # aliases such as C, JS, TS

        if len(alias_normalized) <= 2:

            pattern = (
                r"\b"
                + re.escape(alias_normalized)
                + r"\b"
            )

            if re.search(
                pattern,
                normalized
            ):

                return True

        else:

            if alias_normalized in normalized:

                return True

    return False


# --------------------------------------------------
# Extract Skills From Text
# --------------------------------------------------

def extract_skills(text_value):

    found_skills = []

    for skill, aliases in SKILL_ALIASES.items():

        if skill_exists(
            text_value,
            aliases
        ):

            found_skills.append(
                skill
            )

    return found_skills


# --------------------------------------------------
# Resume Match Request
# --------------------------------------------------

class AnalyzeRequest(BaseModel):

    resume_text: str
    job_description: str


# --------------------------------------------------
# Improved Resume Match Analysis
# --------------------------------------------------

@app.post("/analyze")
def analyze(
    request: AnalyzeRequest
):

    resume_skills = extract_skills(
        request.resume_text
    )

    jd_skills = extract_skills(
        request.job_description
    )

    matched_skills = [

        skill
        for skill in jd_skills
        if skill in resume_skills

    ]

    missing_skills = [

        skill
        for skill in jd_skills
        if skill not in resume_skills

    ]

    if jd_skills:

        match_percentage = round(

            len(matched_skills)
            / len(jd_skills)
            * 100

        )

    else:

        match_percentage = 0

    return {

        "match_percentage":
            match_percentage,

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "resume_skills":
            resume_skills,

        "required_skills":
            jd_skills

    }


# --------------------------------------------------
# AI Analysis Request
# --------------------------------------------------

class AIAnalysisRequest(BaseModel):

    resume_text: str
    job_description: str


# --------------------------------------------------
# AI Analysis
# --------------------------------------------------

@app.post("/ai-analysis")
def ai_analysis(
    request: AIAnalysisRequest
):

    prompt = f"""

You are an AI job application assistant.

Analyze the following resume against
the job description.

RESUME:

{request.resume_text}


JOB DESCRIPTION:

{request.job_description}


Provide:

1. Resume improvement suggestions
2. Important missing skills
3. Three role-specific interview questions
4. Three technical topics the candidate should prepare

Keep the response practical and concise.

"""

    for attempt in range(3):

        try:

            response = client.models.generate_content(

                model="gemini-3.8-flash",

                contents=prompt

            )

            return {

                "ai_analysis":
                    response.text

            }

        except Exception as e:

            error_message = str(e)

            print(

                f"Gemini attempt "
                f"{attempt + 1} failed: "
                f"{error_message}"

            )

            if attempt == 2:

                return {

                    "error":
                        "AI service is temporarily "
                        "unavailable. Please try again "
                        "in a few seconds."

                }


# --------------------------------------------------
# Save Application Request
# --------------------------------------------------

class SaveApplicationRequest(BaseModel):

    resume_text: str

    job_description: str

    match_percentage: int

    matched_skills: list[str]

    missing_skills: list[str]

    ai_analysis: str


# --------------------------------------------------
# Save Application
# --------------------------------------------------

@app.post("/applications")
def save_application(
    request: SaveApplicationRequest
):

    db = SessionLocal()

    try:

        application = Application(

            resume_text=
                request.resume_text,

            job_description=
                request.job_description,

            match_percentage=
                request.match_percentage,

            matched_skills=
                ", ".join(
                    request.matched_skills
                ),

            missing_skills=
                ", ".join(
                    request.missing_skills
                ),

            ai_analysis=
                request.ai_analysis,

            status=
                "Applied"

        )

        db.add(
            application
        )

        db.commit()

        db.refresh(
            application
        )

        return {

            "message":
                "Application saved successfully",

            "application_id":
                application.id

        }

    finally:

        db.close()


# --------------------------------------------------
# Get Applications
# --------------------------------------------------

@app.get("/applications")
def get_applications():

    db = SessionLocal()

    try:

        applications = (

            db.query(Application)

            .order_by(
                Application.created_at.desc()
            )

            .all()

        )

        return [

            {

                "id":
                    application.id,

                "match_percentage":
                    application.match_percentage,

                "matched_skills":
                    application.matched_skills,

                "missing_skills":
                    application.missing_skills,

                "job_description":
                    application.job_description,

                "ai_analysis":
                    application.ai_analysis,

                "status":
                    application.status,

                "created_at":
                    application.created_at

            }

            for application
            in applications

        ]

    finally:

        db.close()


# --------------------------------------------------
# Update Application Status
# --------------------------------------------------

class UpdateStatusRequest(BaseModel):

    status: str


@app.put(
    "/applications/{application_id}/status"
)
def update_application_status(
    application_id: int,
    request: UpdateStatusRequest
):

    allowed_statuses = [

        "Applied",
        "Interview",
        "Selected",
        "Rejected"

    ]

    if request.status not in allowed_statuses:

        return {

            "error":
                "Invalid status. "
                "Use Applied, Interview, "
                "Selected, or Rejected."

        }

    db = SessionLocal()

    try:

        application = (

            db.query(Application)

            .filter(
                Application.id ==
                application_id
            )

            .first()

        )

        if not application:

            return {

                "error":
                    "Application not found"

            }

        application.status = (
            request.status
        )

        db.commit()

        db.refresh(
            application
        )

        return {

            "message":
                "Application status updated",

            "application_id":
                application.id,

            "status":
                application.status

        }

    finally:

        db.close()


# --------------------------------------------------
# Delete Application
# --------------------------------------------------

@app.delete(
    "/applications/{application_id}"
)
def delete_application(
    application_id: int
):

    db = SessionLocal()

    try:

        application = (

            db.query(Application)

            .filter(
                Application.id ==
                application_id
            )

            .first()

        )

        if not application:

            return {

                "error":
                    "Application not found"

            }

        db.delete(
            application
        )

        db.commit()

        return {

            "message":
                "Application deleted successfully"

        }

    finally:

        db.close()

