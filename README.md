\# AI Job Application Assistant



An AI-powered web application that helps job seekers analyze their resumes against job descriptions, identify skill gaps, generate interview preparation suggestions, and track job applications.



\## 🚀 Features



\* 📄 Upload and extract text from PDF resumes

\* 📝 Paste and analyze job descriptions

\* 🎯 Identify skills required by a job description

\* ✅ Find skills that match the resume

\* ❌ Identify missing skills

\* 📊 Calculate a transparent skill-overlap match percentage

\* 🤖 Generate AI-powered resume improvement suggestions

\* 💡 Generate role-specific interview questions

\* 📚 Generate technical preparation topics

\* 💾 Save job applications

\* 📋 View application history

\* 🔄 Track application status

\* 🗑️ Delete saved applications



\## 🛠️ Tech Stack



\### Frontend



\* React.js

\* Vite

\* JavaScript

\* CSS



\### Backend



\* Python

\* FastAPI

\* SQLAlchemy

\* SQLite

\* PyPDF



\### AI



\* Google Gemini API



\### Tools



\* Git

\* GitHub

\* VS Code



\## 🏗️ Architecture



```text

&#x20;                ┌─────────────────────┐

&#x20;                │    React Frontend         │

&#x20;                │      Vite + JS            │

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;                        REST API

&#x20;                           │

&#x20;                           ▼

&#x20;                ┌─────────────────────┐

&#x20;                │   FastAPI Backend         │

&#x20;                │       Python              │

&#x20;                └───────┬───────┬─────┘

&#x20;                          │           │

&#x20;                          │           │

&#x20;                   ┌────▼───┐ ┌─▼────────────┐

&#x20;                   │ SQLite    │ │ Gemini API       │

&#x20;                   │   DB      │ │ AI Analysis      │

&#x20;                   └────────┘ └──────────────┘

```



\## 🔄 Application Workflow



1\. User uploads a PDF resume.

2\. FastAPI extracts the resume text.

3\. User pastes a job description.

4\. The backend extracts relevant skills from both texts.

5\. Resume skills are compared with job requirements.

6\. The application displays:



&#x20;  \* Required skills

&#x20;  \* Matched skills

&#x20;  \* Missing skills

&#x20;  \* Resume skills

&#x20;  \* Match percentage

7\. Gemini generates:



&#x20;  \* Resume improvement suggestions

&#x20;  \* Important missing skills

&#x20;  \* Role-specific interview questions

&#x20;  \* Technical preparation topics

8\. The user can save the application.

9\. Saved applications can be viewed and tracked from application history.



\## 📊 Match Percentage



The current match percentage is calculated using transparent skill overlap:



```text

Matched Required Skills

\----------------------- × 100

Total Required Skills

```



For example:



```text

Required Skills = 10

Matched Skills  = 7



Match Percentage = 70%

```



This is a project-specific skill matching calculation and should not be considered an official ATS score.



\## 🔌 API Endpoints



| Method | Endpoint                    | Purpose                             |

| ------ | --------------------------- | ----------------------------------- |

| GET    | `/hello`                    | Test backend                        |

| POST   | `/upload-resume`            | Extract text from PDF               |

| POST   | `/analyze`                  | Compare resume with job description |

| POST   | `/ai-analysis`              | Generate Gemini AI analysis         |

| POST   | `/applications`             | Save an application                 |

| GET    | `/applications`             | Retrieve application history        |

| PUT    | `/applications/{id}/status` | Update application status           |

| DELETE | `/applications/{id}`        | Delete an application               |



\## 📁 Project Structure



```text

ai-job-application-assistant/

│

├── backend/

│   └── main.py

│

├── frontend/

│   ├── public/

│   └── src/

│       ├── App.jsx

│       ├── style.css

│       ├── App.css

│       ├── index.css

│       └── main.jsx

│

├── .gitignore

└── README.md

```



\## ⚙️ Setup



\### 1. Clone the repository



```bash

git clone https://github.com/Nandu116/ai-job-application-assistant.git



cd ai-job-application-assistant

```



\### 2. Backend Setup



```bash

cd backend



python -m venv venv

```



Activate the virtual environment on Windows:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install dependencies:



```bash

pip install fastapi uvicorn python-multipart pypdf google-genai python-dotenv sqlalchemy

```



\### 3. Configure Gemini API



Create:



```text

backend/.env

```



Add:



```text

GEMINI\_API\_KEY=your\_api\_key\_here

```



Never commit your actual API key to GitHub.



\### 4. Start Backend



```bash

uvicorn main:app --reload

```



Backend:



```text

http://127.0.0.1:8000

```



\### 5. Start Frontend



Open another terminal:



```bash

cd frontend

npm install

npm run dev

```



Frontend:



```text

http://localhost:5173

```



\## 🔐 Security



API keys and local database files are excluded from Git using `.gitignore`.



Sensitive files such as:



```text

.env

applications.db

venv/

node\_modules/

```



are not intended to be committed to the repository.



\## 🔮 Future Improvements



\* User authentication

\* PostgreSQL database

\* Resume tailoring based on job descriptions

\* More advanced semantic skill matching

\* Job application reminders

\* Dashboard analytics

\* Resume version management

\* Cloud deployment

\* Automated job tracking



\## 👨‍💻 Author



\*\*Nandu Bodapatla\*\*



B.Tech — Computer Science \& Engineering (AI/ML)



GitHub: https://github.com/Nandu116



