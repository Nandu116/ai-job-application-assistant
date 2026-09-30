import { useState, useEffect } from "react";
import "./style.css";

function App() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [analysis, setAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const [applications, setApplications] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  // --------------------------------------------------
  // Fetch Application History
  // --------------------------------------------------

  const fetchApplications = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/applications"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          JSON.stringify(data)
        );
      }

      setApplications(data);

    } catch (error) {
      console.error(
        "History Error:",
        error
      );

      alert(
        "Failed to load applications: " +
          error.message
      );

    } finally {
      setHistoryLoading(false);
    }
  };

  // --------------------------------------------------
  // Delete Application
  // --------------------------------------------------

  const deleteApplication = async (
    applicationId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this application?"
      );

    if (!confirmed) {
      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          JSON.stringify(data)
        );
      }

      alert(
        "Application deleted successfully!"
      );

      setSelectedApplication(
        null
      );

      fetchApplications();

    } catch (error) {

      console.error(
        "Delete Error:",
        error
      );

      alert(
        "Failed to delete application: " +
          error.message
      );
    }
  };

  // --------------------------------------------------
  // Update Application Status
  // --------------------------------------------------

  const updateApplicationStatus = async (
    applicationId,
    newStatus
  ) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          JSON.stringify(data)
        );
      }

      setApplications(
        (currentApplications) =>
          currentApplications.map(
            (application) =>
              application.id ===
              applicationId
                ? {
                    ...application,
                    status:
                      newStatus,
                  }
                : application
          )
      );

      if (
        selectedApplication &&
        selectedApplication.id ===
          applicationId
      ) {

        setSelectedApplication({
          ...selectedApplication,
          status:
            newStatus,
        });

      }

    } catch (error) {

      console.error(
        "Status Update Error:",
        error
      );

      alert(
        "Failed to update status: " +
          error.message
      );
    }
  };

  // --------------------------------------------------
  // Load Applications
  // --------------------------------------------------

  useEffect(() => {
    fetchApplications();
  }, []);

  // --------------------------------------------------
  // Upload Resume
  // --------------------------------------------------

  const uploadResume = async () => {

    if (!file) {

      alert(
        "Please select a PDF resume first."
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    setLoading(true);

    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/upload-resume",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          JSON.stringify(data)
        );

      }

      setResumeText(
        data.text
      );

    } catch (error) {

      console.error(
        "Upload Error:",
        error
      );

      alert(
        "Failed to upload resume: " +
          error.message
      );

    } finally {

      setLoading(false);

    }
  };

  // --------------------------------------------------
  // Analyze Application
  // --------------------------------------------------

  const analyzeApplication =
    async () => {

      if (!resumeText) {

        alert(
          "Please upload your resume first."
        );

        return;
      }

      if (!jobDescription) {

        alert(
          "Please enter the job description."
        );

        return;
      }

      setLoading(true);

      try {

        const response =
          await fetch(
            "http://127.0.0.1:8000/analyze",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                resume_text:
                  resumeText,

                job_description:
                  jobDescription,

              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            JSON.stringify(data)
          );

        }

        setAnalysis(data);

      } catch (error) {

        console.error(
          "Analysis Error:",
          error
        );

        alert(
          "Analysis failed: " +
            error.message
        );

      } finally {

        setLoading(false);

      }
    };

  // --------------------------------------------------
  // AI Analysis
  // --------------------------------------------------

  const runAIAnalysis =
    async () => {

      if (!resumeText) {

        alert(
          "Please upload your resume first."
        );

        return;
      }

      if (!jobDescription) {

        alert(
          "Please enter the job description."
        );

        return;
      }

      setAiLoading(true);

      setAiAnalysis("");

      try {

        const response =
          await fetch(
            "http://127.0.0.1:8000/ai-analysis",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                resume_text:
                  resumeText,

                job_description:
                  jobDescription,

              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            JSON.stringify(data)
          );

        }

        if (data.error) {

          throw new Error(
            data.error
          );

        }

        setAiAnalysis(
          data.ai_analysis
        );

      } catch (error) {

        console.error(
          "AI Analysis Error:",
          error
        );

        alert(
          "AI analysis failed:\n\n" +
            error.message
        );

      } finally {

        setAiLoading(false);

      }
    };

  // --------------------------------------------------
  // Save Application
  // --------------------------------------------------

  const saveApplication =
    async () => {

      if (!analysis) {

        alert(
          "Please analyze the application first."
        );

        return;
      }

      try {

        const response =
          await fetch(
            "http://127.0.0.1:8000/applications",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                resume_text:
                  resumeText,

                job_description:
                  jobDescription,

                match_percentage:
                  analysis.match_percentage,

                matched_skills:
                  analysis.matched_skills,

                missing_skills:
                  analysis.missing_skills,

                ai_analysis:
                  aiAnalysis,

              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            JSON.stringify(data)
          );

        }

        alert(
          "Application saved successfully!"
        );

        fetchApplications();

      } catch (error) {

        console.error(
          "Save Error:",
          error
        );

        alert(
          "Failed to save application: " +
            error.message
        );

      }
    };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div className="app">

      <div className="container">

        {/* HEADER */}

        <header className="header">

          <h1>
            AI Job Application Assistant
          </h1>

          <p>
            Analyze your resume, compare it
            with a job description, and get
            AI-powered recommendations.
          </p>

        </header>


        {/* RESUME */}

        <div className="card">

          <h2>
            📄 Resume
          </h2>

          <div className="upload-area">

            <p>
              Select your PDF resume
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={(event) => {

                setFile(
                  event.target.files[0]
                );

              }}
            />

            <br />

            <button
              onClick={
                uploadResume
              }
              disabled={loading}
            >

              {loading
                ? "Uploading..."
                : "Upload Resume"}

            </button>

          </div>


          {resumeText && (

            <div>

              <h3>
                Extracted Resume Text
              </h3>

              <div className="resume-text">

                {resumeText}

              </div>

            </div>

          )}

        </div>


        {/* JOB DESCRIPTION */}

        <div className="card">

          <h2>
            📝 Job Description
          </h2>

          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(event) => {

              setJobDescription(
                event.target.value
              );

            }}
          />

          <p>
            Characters:{" "}
            {jobDescription.length}
          </p>

          <button
            onClick={
              analyzeApplication
            }
            disabled={loading}
          >

            {loading
              ? "Analyzing..."
              : "Analyze Application"}

          </button>

        </div>


        {/* MATCH ANALYSIS */}

        {analysis && (

          <div className="card">

            <h2>
              📊 Resume Match Analysis
            </h2>


            {/* MATCH SCORE */}

            <div className="match-score">

              <p>
                Resume Match
              </p>

              <h3>
                {
                  analysis.match_percentage
                }%
              </h3>

            </div>


            {/* REQUIRED SKILLS */}

            <div>

              <h3>
                🎯 Required Skills
              </h3>

              <div className="skills">

                {analysis.required_skills
                  ?.map(
                    (skill) => (

                      <span
                        className="skill"
                        key={skill}
                      >
                        {skill}
                      </span>

                    )
                  )}

              </div>

            </div>


            {/* MATCHED + MISSING */}

            <div className="result-grid">

              <div>

                <h3>
                  ✅ Matched Skills
                </h3>

                <div className="skills">

                  {analysis.matched_skills
                    ?.map(
                      (skill) => (

                        <span
                          className="skill"
                          key={skill}
                        >
                          {skill}
                        </span>

                      )
                    )}

                </div>

              </div>


              <div>

                <h3>
                  ❌ Missing Skills
                </h3>

                <div className="skills">

                  {analysis.missing_skills
                    ?.map(
                      (skill) => (

                        <span
                          className="skill missing-skill"
                          key={skill}
                        >
                          {skill}
                        </span>

                      )
                    )}

                </div>

              </div>

            </div>


            {/* RESUME SKILLS */}

            <div>

              <h3>
                📚 Skills Found in Resume
              </h3>

              <div className="skills">

                {analysis.resume_skills
                  ?.map(
                    (skill) => (

                      <span
                        className="skill"
                        key={skill}
                      >
                        {skill}
                      </span>

                    )
                  )}

              </div>

            </div>


            <button
              onClick={
                saveApplication
              }
            >
              💾 Save Application
            </button>

          </div>

        )}


        {/* AI ANALYSIS */}

        <div className="card">

          <h2>
            🤖 AI Analysis
          </h2>

          <p>
            Get personalized resume
            suggestions, missing skills,
            interview questions, and
            preparation topics.
          </p>

          <button
            className="ai-button"
            onClick={
              runAIAnalysis
            }
            disabled={aiLoading}
          >

            {aiLoading
              ? "Generating AI Analysis..."
              : "Analyze with AI"}

          </button>


          {aiAnalysis && (

            <div className="ai-result">

              {aiAnalysis}

            </div>

          )}

        </div>


        {/* APPLICATION HISTORY */}

        <div className="card">

          <h2>
            📚 Application History
          </h2>


          {historyLoading ? (

            <p>
              Loading applications...
            </p>

          ) : applications.length === 0 ? (

            <p>
              No saved applications yet.
            </p>

          ) : (

            <div>

              <p>
                Total Applications:{" "}
                {applications.length}
              </p>


              {applications.map(
                (application) => (

                  <div
                    key={
                      application.id
                    }
                    className="history-item"
                  >

                    <h3>
                      Application #
                      {application.id}
                    </h3>


                    <p>
                      Match:{" "}
                      <strong>
                        {
                          application.match_percentage
                        }%
                      </strong>
                    </p>


                    {/* STATUS */}

                    <p>
                      Status:
                    </p>

                    <select
                      value={
                        application.status ||
                        "Applied"
                      }
                      onChange={(event) => {

                        updateApplicationStatus(
                          application.id,
                          event.target.value
                        );

                      }}
                    >

                      <option value="Applied">
                        🟡 Applied
                      </option>

                      <option value="Interview">
                        🔵 Interview
                      </option>

                      <option value="Selected">
                        🟢 Selected
                      </option>

                      <option value="Rejected">
                        🔴 Rejected
                      </option>

                    </select>


                    <p>
                      Matched Skills:{" "}
                      {
                        application.matched_skills
                      }
                    </p>


                    <p>
                      Missing Skills:{" "}
                      {
                        application.missing_skills
                      }
                    </p>


                    <p>
                      Saved:{" "}
                      {
                        new Date(
                          application.created_at
                        ).toLocaleString()
                      }
                    </p>


                    <button
                      onClick={() => {

                        setSelectedApplication(
                          application
                        );

                      }}
                    >
                      👁️ View Details
                    </button>


                    <button
                      onClick={() => {

                        deleteApplication(
                          application.id
                        );

                      }}
                      style={{
                        background:
                          "#dc2626",

                        marginLeft:
                          "10px",
                      }}
                    >
                      🗑️ Delete
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* APPLICATION DETAILS */}

        {selectedApplication && (

          <div className="card">

            <h2>
              🔎 Application Details
            </h2>


            <p>

              <strong>
                Application #
                {
                  selectedApplication.id
                }
              </strong>

            </p>


            {/* STATUS */}

            <p>
              <strong>
                Status:
              </strong>
            </p>


            <select
              value={
                selectedApplication.status ||
                "Applied"
              }
              onChange={(event) => {

                updateApplicationStatus(
                  selectedApplication.id,
                  event.target.value
                );

              }}
            >

              <option value="Applied">
                🟡 Applied
              </option>

              <option value="Interview">
                🔵 Interview
              </option>

              <option value="Selected">
                🟢 Selected
              </option>

              <option value="Rejected">
                🔴 Rejected
              </option>

            </select>


            {/* MATCH SCORE */}

            <div className="match-score">

              <p>
                Resume Match
              </p>

              <h3>
                {
                  selectedApplication
                    .match_percentage
                }%
              </h3>

            </div>


            {/* MATCHED SKILLS */}

            <h3>
              Matched Skills
            </h3>

            <div className="skills">

              {
                selectedApplication
                  .matched_skills
                  ?.split(", ")
                  .filter(Boolean)
                  .map(
                    (skill) => (

                      <span
                        className="skill"
                        key={skill}
                      >
                        {skill}
                      </span>

                    )
                  )
              }

            </div>


            {/* MISSING SKILLS */}

            <h3>
              Missing Skills
            </h3>

            <div className="skills">

              {
                selectedApplication
                  .missing_skills
                  ?.split(", ")
                  .filter(Boolean)
                  .map(
                    (skill) => (

                      <span
                        className="skill missing-skill"
                        key={skill}
                      >
                        {skill}
                      </span>

                    )
                  )
              }

            </div>


            {/* JOB DESCRIPTION */}

            <h3>
              Job Description
            </h3>

            <div className="resume-text">

              {
                selectedApplication
                  .job_description
              }

            </div>


            {/* AI ANALYSIS */}

            <h3>
              🤖 AI Analysis
            </h3>

            <div className="ai-result">

              {
                selectedApplication
                  .ai_analysis ||
                "No AI analysis available."
              }

            </div>


            <button
              onClick={() => {

                setSelectedApplication(
                  null
                );

              }}
            >
              Close Details
            </button>


            <button
              onClick={() => {

                deleteApplication(
                  selectedApplication.id
                );

              }}
              style={{
                background:
                  "#dc2626",

                marginLeft:
                  "10px",
              }}
            >
              🗑️ Delete Application
            </button>

          </div>

        )}

      </div>

    </div>

  );
}

export default App;