# MatchPulse

MatchPulse compares recognized skills and terms in a resume with those in a
job description. The score is the percentage of recognized job-description
terms found in the resume. It is a transparent keyword comparison, not an
AI-generated assessment or a hiring prediction.

## Run locally on Windows

You need Python installed. Open two PowerShell terminals from the project
folder.

In the first terminal, start the API:

```powershell
cd Backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

In the second terminal, serve the frontend:

```powershell
cd Frontend
python -m http.server 5500
```

Open <http://localhost:5500> in your browser. Keep both terminals open while
using the app. The API health check is at <http://localhost:8000/health>, and
interactive API documentation is at <http://localhost:8000/docs>.

The API allows common local development origins (`localhost` and
`127.0.0.1` on ports 4173, 5173, 5500, and 5501). For a different frontend
origin or deployment, set `CORS_ORIGINS` to a comma-separated list of exact
origins, including the scheme and port, before starting the API.

## API

- `GET /health` - health check
- `POST /analyze` - compare resume and job-description text

Example request:

```json
{
  "cv_text": "Frontend developer with React, JavaScript, CSS, and REST API experience.",
  "job_description": "Seeking a frontend developer with React, TypeScript, CSS, and Git experience."
}
```

The analyzer only counts recognized skills and terms from its built-in
vocabulary; it does not use a language model. Resume and job-description text
is processed in memory and is not saved by this application.

## Tests

```powershell
cd Backend
python -m pytest -q
```
