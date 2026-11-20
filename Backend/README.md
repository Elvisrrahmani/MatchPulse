# MatchPulse Backend

FastAPI service for the MatchPulse resume and job-description analyzer.

## Run locally

```powershell
cd Backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. Its interactive documentation is available at `http://localhost:8000/docs`.

## Endpoints

- `GET /health` - health check
- `POST /analyze` - compare resume and job-description text

Example request:

```json
{
  "cv_text": "Frontend developer with React, JavaScript, CSS, and REST API experience.",
  "job_description": "Seeking a frontend developer with React, TypeScript, CSS, and Git experience."
}
```

Set `CORS_ORIGINS` to a comma-separated list when deploying the frontend from another origin.
