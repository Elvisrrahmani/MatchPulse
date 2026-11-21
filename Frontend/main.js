
// ==========================================
// MATCHPULSE — APPLICATION ENGINE
// ==========================================

// Change this URL if the FastAPI server is deployed or runs on a different port.
const API_BASE_URL = "http://localhost:8000";

const API_ENDPOINT = `${API_BASE_URL}/analyze`;

const MAX_LENGTH = 15000;

// ==========================================
// DOM ELEMENTS
// ==========================================

const cvInput = document.getElementById("cvText");
const jobInput = document.getElementById("jobDescription");

const analyzeBtn = document.getElementById("analyzeBtn");
const buttonText = document.getElementById("buttonText");
const buttonIcon = document.getElementById("buttonIcon");
const spinner = document.getElementById("spinner");

const toast = document.getElementById("toast");

// ==========================================
// SAMPLE DATA
// ==========================================

const sampleResumes = {
    frontend: `John Smith
Frontend Developer

Professional Summary:
Frontend developer with 3 years of experience building responsive web applications.

Technical Skills:
JavaScript, HTML, CSS, React, Git, REST APIs, Responsive Design.

Experience:
Developed interactive web applications using React.
Collaborated with backend developers to integrate REST APIs.
Improved website performance and user experience.
Worked with Git and agile development workflows.

Education:
Bachelor's Degree in Computer Science.`,

    backend: `Maya Patel
Backend Developer

Backend developer with 4 years of experience building reliable Python services and REST APIs.
Skills: Python, FastAPI, SQL, PostgreSQL, Docker, AWS, Git, pytest, CI/CD.
Built authenticated API endpoints, improved database query performance, and containerized services for cloud deployment.
Collaborated with frontend and product teams to deliver secure, tested features.
Bachelor's Degree in Software Engineering.`,

    "data-analyst": `Jordan Lee
Data Analyst

Data analyst with 3 years of experience turning business data into clear recommendations.
Skills: SQL, Excel, Python, pandas, Tableau, Power BI, data visualization, statistics.
Created dashboards for weekly business reporting and automated recurring data cleanup with Python.
Presented findings to stakeholders and identified trends that improved campaign performance.
Bachelor's Degree in Statistics.`,

    "product-manager": `Taylor Morgan
Product Manager

Product manager with 5 years of experience guiding cross-functional teams from discovery to launch.
Skills: product strategy, roadmaps, user research, agile, Scrum, Jira, analytics, prioritization.
Led customer interviews, translated feedback into product requirements, and managed quarterly roadmaps.
Partnered with design, engineering, and marketing to launch product improvements and measure adoption.
Bachelor's Degree in Business Administration.`,

    "ux-designer": `Alex Rivera
UX Designer

UX designer with 4 years of experience creating accessible, user-friendly web experiences.
Skills: Figma, user research, wireframing, prototyping, usability testing, accessibility, design systems.
Designed responsive prototypes, ran usability sessions, and iterated on flows using customer feedback.
Worked closely with product managers and engineers to deliver consistent interface patterns.
Bachelor's Degree in Interaction Design.`
};

const sampleJobs = {
    frontend: `Frontend Developer

We are looking for a skilled Frontend Developer to join our development team.

Requirements:
- 3+ years of frontend development experience.
- Strong knowledge of JavaScript, HTML, and CSS.
- Experience with React and modern frontend frameworks.
- Understanding of REST APIs and API integration.
- Knowledge of Git and version control.
- Experience with responsive web design.
- Strong problem-solving and communication skills.

Responsibilities:
Build modern web interfaces.
Optimize application performance.
Collaborate with backend developers.
Maintain clean and reusable code.`,

    backend: `Backend Developer

We are looking for a Backend Developer to build reliable services for our product.

Requirements:
- 3+ years of backend development experience.
- Strong Python skills and experience with FastAPI or similar frameworks.
- Experience designing REST APIs and working with PostgreSQL and SQL.
- Familiarity with Docker, AWS, Git, and CI/CD.
- Knowledge of automated testing with pytest.

Responsibilities:
Design and maintain secure API services.
Improve database performance and reliability.
Write tests and contribute to code reviews.
Work with product and frontend teams to ship features.`,

    "data-analyst": `Data Analyst

We are hiring a Data Analyst to help teams make informed business decisions.

Requirements:
- Experience with SQL, Excel, and Python.
- Familiarity with pandas and data cleaning.
- Experience creating dashboards with Tableau or Power BI.
- Knowledge of statistics and data visualization.
- Strong communication skills when presenting insights.

Responsibilities:
Analyze business and campaign performance data.
Build and maintain dashboards and recurring reports.
Explain trends and recommendations to stakeholders.
Improve data quality and reporting workflows.`,

    "product-manager": `Product Manager

We are looking for a Product Manager to guide products from discovery through delivery.

Requirements:
- Experience owning product strategy and roadmaps.
- Strong user research and prioritization skills.
- Familiarity with Agile, Scrum, and Jira.
- Ability to use analytics to measure product outcomes.
- Excellent cross-functional communication.

Responsibilities:
Gather customer insights and define product requirements.
Prioritize opportunities and maintain the product roadmap.
Coordinate design, engineering, and business partners.
Track adoption and use feedback to guide improvements.`,

    "ux-designer": `UX Designer

Join our design team to create intuitive and accessible digital products.

Requirements:
- Proficiency with Figma and interactive prototyping.
- Experience in user research, wireframing, and usability testing.
- Understanding of accessibility and responsive design.
- Experience maintaining or contributing to design systems.
- Strong collaboration and communication skills.

Responsibilities:
Plan research and translate user needs into flows.
Create wireframes, prototypes, and polished interface designs.
Test designs with users and iterate on feedback.
Partner with product managers and engineers through delivery.`
};

// ==========================================
// CHARACTER COUNTERS
// ==========================================

function updateCounter(input, counter) {
    counter.textContent =
        `${input.value.length.toLocaleString()} / ${MAX_LENGTH.toLocaleString()}`;
}

function loadRandomSample(samples, select, input, counter) {
    const options = Object.keys(samples);
    const randomOption = options[Math.floor(Math.random() * options.length)];

    select.value = randomOption;
    input.value = samples[randomOption];
    updateCounter(input, counter);
}

cvInput.addEventListener("input", () => {
    updateCounter(cvInput, document.getElementById("cvCount"));
});

jobInput.addEventListener("input", () => {
    updateCounter(jobInput, document.getElementById("jobCount"));
});

// ==========================================
// SAMPLE BUTTONS
// ==========================================

document.getElementById("sampleCv").addEventListener("click", () => {
    const sample = document.getElementById("sampleCvSelect").value;
    cvInput.value = sampleResumes[sample];
    updateCounter(cvInput, document.getElementById("cvCount"));
});

document.getElementById("sampleJob").addEventListener("click", () => {
    const sample = document.getElementById("sampleJobSelect").value;
    jobInput.value = sampleJobs[sample];
    updateCounter(jobInput, document.getElementById("jobCount"));
});

document.getElementById("randomCv").addEventListener("click", () => {
    loadRandomSample(
        sampleResumes,
        document.getElementById("sampleCvSelect"),
        cvInput,
        document.getElementById("cvCount")
    );
});

document.getElementById("randomJob").addEventListener("click", () => {
    loadRandomSample(
        sampleJobs,
        document.getElementById("sampleJobSelect"),
        jobInput,
        document.getElementById("jobCount")
    );
});

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}

// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {
    analyzeBtn.disabled = isLoading;

    buttonText.textContent = isLoading
        ? "Analyzing your resume..."
        : "Analyze resume match";

    buttonIcon.classList.toggle("hidden", isLoading);
    spinner.classList.toggle("hidden", !isLoading);
}

// ==========================================
// INPUT VALIDATION
// ==========================================

function validateInputs() {
    const cv = cvInput.value.trim();
    const job = jobInput.value.trim();

    if (!cv || !job) {
        showToast("Please provide both your resume and the job description.");
        return false;
    }

    if (cv.length < 30) {
        showToast("Your resume needs more information for accurate analysis.");
        return false;
    }

    if (job.length < 30) {
        showToast("Please provide a more detailed job description.");
        return false;
    }

    return true;
}

// ==========================================
// API REQUEST
// ==========================================

async function analyzeResume() {
    if (!validateInputs()) return;

    setLoading(true);

    const payload = {
        cv_text: cvInput.value.trim(),
        job_description: jobInput.value.trim()
    };

    try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 60000);

        let response;

        try {
            response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            let errorMessage = `Server error (${response.status}).`;

            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = String(errorData.detail);
                }
            } catch {
                // Keep the default error message.
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const score = Number(data.match_score);

        if (!Number.isFinite(score) || score < 0 || score > 100) {
            throw new Error("The API returned an invalid match score.");
        }

        sessionStorage.setItem("matchpulse-report", JSON.stringify(data));
        window.location.assign("report.html");

    } catch (error) {
        console.error("MatchPulse API error:", error);

        if (error.name === "AbortError") {
            showToast("The request timed out. Please try again.");
        } else if (error instanceof TypeError) {
            showToast("Unable to reach the API. Check your connection and backend URL.");
        } else {
            showToast(error.message || "Something went wrong. Please try again.");
        }

    } finally {
        setLoading(false);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

analyzeBtn.addEventListener("click", analyzeResume);
