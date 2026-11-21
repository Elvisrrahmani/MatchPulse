import os
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="MatchPulse API",
    description="Keyword-based resume and job-description comparison.",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        ",".join(
            f"http://{host}:{port}"
            for host in ("localhost", "127.0.0.1")
            for port in (4173, 5173, 5500, 5501)
        ),
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    cv_text: str = Field(min_length=30, max_length=15000)
    job_description: str = Field(min_length=30, max_length=15000)


class AnalysisResponse(BaseModel):
    match_score: float
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]


SKILL_TERMS = {
    "agile": "agile",
    "api": "api",
    "apis": "api",
    "rest": "rest",
    "rest api": "api",
    "rest apis": "api",
    "graphql": "graphql",
    "javascript": "javascript",
    "typescript": "typescript",
    "python": "python",
    "java": "java",
    "c++": "c++",
    "c#": "c#",
    "go": "go",
    "rust": "rust",
    "html": "html",
    "css": "css",
    "sass": "sass",
    "react": "react",
    "reactjs": "react",
    "next.js": "next.js",
    "vue": "vue",
    "angular": "angular",
    "node.js": "node.js",
    "nodejs": "node.js",
    "express": "express",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "sql": "sql",
    "postgresql": "postgresql",
    "mysql": "mysql",
    "mongodb": "mongodb",
    "redis": "redis",
    "aws": "aws",
    "azure": "azure",
    "gcp": "gcp",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "git": "git",
    "github": "github",
    "linux": "linux",
    "testing": "testing",
    "unit testing": "unit testing",
    "jest": "jest",
    "cypress": "cypress",
    "selenium": "selenium",
    "figma": "figma",
    "responsive design": "responsive design",
    "accessibility": "accessibility",
    "wireframing": "wireframing",
    "wireframe": "wireframing",
    "prototyping": "prototyping",
    "prototype": "prototyping",
    "usability testing": "usability testing",
    "design systems": "design systems",
    "design system": "design systems",
    "user research": "user research",
    "product strategy": "product strategy",
    "roadmaps": "roadmap",
    "roadmap": "roadmap",
    "prioritization": "prioritization",
    "analytics": "analytics",
    "statistics": "statistics",
    "data visualization": "data visualization",
    "data cleaning": "data cleaning",
    "pytest": "pytest",
    "ux": "ux",
    "ui": "ui",
    "communication": "communication",
    "communication skills": "communication",
    "problem-solving": "problem-solving",
    "problem solving": "problem-solving",
    "leadership": "leadership",
    "project management": "project management",
    "scrum": "scrum",
    "jira": "jira",
    "tableau": "tableau",
    "power bi": "power bi",
    "excel": "excel",
    "machine learning": "machine learning",
    "data analysis": "data analysis",
    "data science": "data science",
    "tensorflow": "tensorflow",
    "pytorch": "pytorch",
    "pandas": "pandas",
    "numpy": "numpy",
    "security": "security",
    "ci/cd": "ci/cd",
    "devops": "devops",
}


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w+#./-]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def extract_terms(text: str) -> list[str]:
    normalized = normalize_text(text)
    found: set[str] = set()
    matched_spans: list[tuple[int, int]] = []

    for phrase in sorted(SKILL_TERMS, key=len, reverse=True):
        pattern = r"(?<!\w)" + re.escape(normalize_text(phrase)) + r"(?!\w)"
        for match in re.finditer(pattern, normalized):
            span = match.span()
            if any(span[0] < end and start < span[1] for start, end in matched_spans):
                continue
            matched_spans.append(span)
            found.add(SKILL_TERMS[phrase])

    return sorted(found, key=str.lower)


def create_recommendations(
    missing: list[str],
    cv_text: str,
    job_description: str,
) -> list[str]:
    recommendations: list[str] = []

    if missing:
        displayed = ", ".join(missing[:5])
        recommendations.append(
            f"Consider addressing these missing terms if they genuinely reflect your experience: {displayed}."
        )

    if re.search(r"\b\d+\+?\s*(years?|yrs)\b", cv_text, re.I) is None:
        if re.search(r"\b\d+\+?\s*(years?|yrs)\b", job_description, re.I):
            recommendations.append(
                "Add measurable years of relevant experience and explain how it applies to this role."
            )

    if not re.search(r"\b(improved|increased|reduced|built|developed|delivered|led)\b", cv_text, re.I):
        recommendations.append(
            "Use action verbs and describe concrete outcomes in your resume."
        )

    if not re.search(r"\b\d+(?:\.?\d+)?%|\$\d+|\b\d+\s*(users?|customers?|projects?)\b", cv_text, re.I):
        recommendations.append(
            "Quantify achievements with metrics such as percentage improvements, users, revenue, or project scale."
        )

    recommendations.append(
        "Mirror relevant terminology from the job description naturally, without copying it verbatim."
    )

    return recommendations[:5]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> AnalysisResponse:
    job_terms = extract_terms(request.job_description)

    if not job_terms:
        raise HTTPException(
            status_code=422,
            detail="Could not identify recognized skills or terms in the job description.",
        )

    resume_terms = set(extract_terms(request.cv_text))
    matched = sorted(resume_terms.intersection(job_terms), key=str.lower)
    missing = sorted(set(job_terms).difference(resume_terms), key=str.lower)

    match_score = round((len(matched) / len(job_terms)) * 100, 1)

    return AnalysisResponse(
        match_score=match_score,
        matched_keywords=matched,
        missing_keywords=missing,
        recommendations=create_recommendations(
            missing,
            request.cv_text,
            request.job_description,
        ),
    )
