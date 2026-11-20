const reportKey = "matchpulse-report";
const reportSection = document.getElementById("report");
const emptyReport = document.getElementById("emptyReport");

function getScoreDescription(score) {
    if (score >= 85) {
        return {
            title: "Excellent compatibility",
            description: "Your resume aligns strongly with this job description."
        };
    }

    if (score >= 70) {
        return {
            title: "Strong compatibility",
            description: "Your resume matches many of the role's requirements."
        };
    }

    if (score >= 50) {
        return {
            title: "Moderate compatibility",
            description: "There are relevant skills, but some gaps remain."
        };
    }

    return {
        title: "Compatibility needs improvement",
        description: "Your resume may need more relevant skills and experience."
    };
}

function renderList(container, values, emptyMessage) {
    container.replaceChildren();

    if (values.length === 0) {
        const empty = document.createElement("span");
        empty.className = "empty-message";
        empty.textContent = emptyMessage;
        container.appendChild(empty);
        return;
    }

    for (const value of values) {
        const item = document.createElement("span");
        item.className = "keyword-badge";
        item.textContent = String(value);
        container.appendChild(item);
    }
}

function renderRecommendations(recommendations) {
    const list = document.getElementById("recommendations");
    list.replaceChildren();

    const values = recommendations.length
        ? recommendations
        : ["No recommendations were returned."];

    for (const recommendation of values) {
        const item = document.createElement("li");
        item.textContent = String(recommendation);
        list.appendChild(item);
    }
}

function showEmptyReport() {
    reportSection.classList.add("hidden");
    emptyReport.classList.remove("hidden");
}

function renderReport() {
    let data;

    try {
        const storedReport = sessionStorage.getItem(reportKey);
        if (!storedReport) {
            showEmptyReport();
            return;
        }
        data = JSON.parse(storedReport);
    } catch (error) {
        console.error("Unable to read the MatchPulse report:", error);
        showEmptyReport();
        return;
    }

    const score = Number(data.match_score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
        console.error("The saved MatchPulse report has an invalid score.");
        showEmptyReport();
        return;
    }

    const matched = Array.isArray(data.matched_keywords)
        ? data.matched_keywords
        : [];
    const missing = Array.isArray(data.missing_keywords)
        ? data.missing_keywords
        : [];
    const recommendations = Array.isArray(data.recommendations)
        ? data.recommendations
        : [];
    const interpretation = getScoreDescription(score);

    document.getElementById("matchScore").textContent = `${Math.round(score)}%`;
    document.getElementById("scoreTitle").textContent = interpretation.title;
    document.getElementById("scoreDescription").textContent =
        interpretation.description;
    document.getElementById("scoreGauge").style.setProperty(
        "--score",
        `${score}%`
    );
    document.getElementById("matchedCount").textContent = matched.length;
    document.getElementById("missingCount").textContent = missing.length;

    renderList(
        document.getElementById("matchedKeywords"),
        matched,
        "No matching keywords found."
    );
    renderList(
        document.getElementById("missingKeywords"),
        missing,
        "No missing keywords found."
    );
    renderRecommendations(recommendations);
}

renderReport();
