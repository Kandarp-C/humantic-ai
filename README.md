🚀 Humantic AI

Your AI research buddy that thinks after you stop.

Humantic AI is an autonomous research companion that continues working even when you don’t. It transforms idle AI compute time into deep, structured insights — delivering meaningful findings, trends, and opportunities directly to you.

Unlike traditional AI tools that stop when you close the tab, Humantic AI keeps thinking, researching, and discovering in the background.

🧠 What Makes It Different?

Most AI tools are reactive.
Humantic AI is proactive, persistent, and personal.

🔁 Works after you leave — runs multi-cycle research autonomously
🧩 Finds insights, not just answers — detects patterns, contradictions, and opportunities
🎯 Understands you — adapts to your goals, domain, and preferences
📡 Real-time delivery — findings stream live to your dashboard
🤝 Feels like a buddy — explains why something matters to you
✨ Core Features
🔴 Autonomous Research Engine
Breaks topics into subtopics
Runs iterative deep research cycles
Refines understanding over time
Generates structured findings
📊 Structured Findings Dashboard
Categorized insights:
Insights
Trends
Opportunities
Experimental
Confidence indicators (High / Medium / Speculative)
Source-backed results
🧠 “Why This?” Transparency

Every finding includes:

A personalized explanation of why it matters to you

⚡ Real-Time Updates
WebSocket-powered live feed
Findings appear instantly as they’re discovered
📌 Pinned Interests
Tell the system what matters most
Continuous monitoring & updates
🔐 Authentication & User Profiles
Secure login/signup (Supabase Auth)
Personalized onboarding
Adaptive research based on user profile
🔄 Background Processing
Powered by Celery + Redis
Fully asynchronous research pipeline
🏗️ Tech Stack
Frontend
React + Vite
Framer Motion (animations)
Axios (API calls)
WebSockets
Backend
FastAPI (Python)
Supabase (Auth + Database)
Celery + Redis (background jobs)
Gemini API (AI research engine)
📂 Project Structure
humantic-ai/
├── frontend/        # React app
├── backend/         # FastAPI backend
│   ├── app/
│   │   ├── routers/     # API endpoints
│   │   ├── services/    # Gemini, research engine
│   │   ├── tasks/       # Celery workers
│   │   └── models/      # Schemas
⚙️ Setup & Installation
1️⃣ Clone the Repo
git clone https://github.com/your-username/humantic-ai.git
cd humantic-ai
2️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt

Create .env:

SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

GEMINI_API_KEY=your_key

REDIS_URL=redis://localhost:6379/0

Run backend:

uvicorn app.main:app --reload
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
4️⃣ Start Background Workers
# Celery Worker
celery -A app.tasks.celery_app worker --loglevel=info

# Celery Beat Scheduler
celery -A app.tasks.celery_app beat --loglevel=info

# Redis
redis-server
🔄 How It Works
User submits a research topic
Topic is stored in database
Celery worker picks up the task
Gemini AI:
Generates subtopics
Researches deeply
Analyzes results
Findings are:
Stored in DB
Sent via WebSocket
Dashboard updates in real-time
🧪 API Endpoints
Auth
POST /api/auth/signup
POST /api/auth/login
Research
POST /api/research
GET /api/research
Findings
GET /api/findings
PATCH /api/findings/{id}
WebSocket
/ws/findings
🎯 Use Cases
📈 Market research
🧑‍💼 Consulting prep
📊 Competitive analysis
🧠 Continuous learning
🚀 Startup intelligence
📸 Demo Flow
Sign up & onboard
Submit a research topic
Watch findings appear live
Expand “Why This?”
Pin an interest
Submit another topic → see improved results
🛣️ Roadmap
Behavioral pattern detection
Auto-follow-up research
Friend-like AI check-ins
Team collaboration mode
Smart notifications & nudges
🧩 Philosophy

“AI shouldn’t wait for you. It should work with you — even when you’re gone.”

Humantic AI reduces cognitive load by:

remembering what you care about
continuing what you started
surfacing what you didn’t think to ask
🤝 Contributing

Contributions are welcome!

# Fork the repo
# Create a branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "Added feature"

# Push
git push origin feature/your-feature
📜 License

MIT License

💡 Final Note

Humantic AI is not just a tool.

It’s a system that:

observes
learns
adapts
and acts for you.
