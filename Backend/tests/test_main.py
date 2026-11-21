from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_local_frontend_origin_is_allowed_by_cors():
    response = client.options(
        "/analyze",
        headers={
            "Origin": "http://localhost:5500",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5500"


def test_analyze_returns_expected_shape():
    response = client.post(
        "/analyze",
        json={
            "cv_text": (
                "Frontend developer with 3 years of experience building React "
                "and JavaScript applications using REST APIs, Git, and CSS."
            ),
            "job_description": (
                "Frontend developer role requiring 3 years of JavaScript, React, "
                "CSS, REST APIs, Git, responsive design, and communication skills."
            ),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert set(data) == {
        "match_score",
        "matched_keywords",
        "missing_keywords",
        "recommendations",
    }
    assert 0 <= data["match_score"] <= 100
    assert isinstance(data["matched_keywords"], list)
    assert isinstance(data["missing_keywords"], list)
    assert isinstance(data["recommendations"], list)


def test_analyze_rejects_short_input():
    response = client.post(
        "/analyze",
        json={"cv_text": "Short", "job_description": "Short"},
    )

    assert response.status_code == 422


def test_generic_keywords_do_not_include_trailing_punctuation():
    response = client.post(
        "/analyze",
        json={
            "cv_text": "Software developer with CSS and modern frontend experience.",
            "job_description": "We are looking for a frontend developer skilled in CSS.",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert all("." not in keyword for keyword in data["missing_keywords"])


def test_score_only_counts_recognized_terms_and_deduplicates_aliases():
    response = client.post(
        "/analyze",
        json={
            "cv_text": (
                "I built reliable software for teams and projects. "
                "My experience includes REST APIs and Python."
            ),
            "job_description": (
                "We are looking for a reliable developer to build software for "
                "teams and projects. Requirements include REST APIs, API "
                "development, and Python."
            ),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["matched_keywords"] == ["api", "python"]
    assert data["missing_keywords"] == []
    assert data["match_score"] == 100


def test_job_description_without_recognized_terms_is_rejected():
    response = client.post(
        "/analyze",
        json={
            "cv_text": "Experienced project leader delivering successful outcomes.",
            "job_description": "We need a motivated person for an exciting role.",
        },
    )

    assert response.status_code == 422
