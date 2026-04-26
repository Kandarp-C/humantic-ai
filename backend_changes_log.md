# Humantic AI — Backend Changes Log

## Files Written / Modified (Last Session)

---

### 1. `backend/app/models/enums.py`
**Action:** Full rewrite

Defined 7 string enums using `str, Enum`:
- `UserDomain` — consultant, analyst, product_manager, researcher, other
- `ResearchDepth` — quick_summaries, balanced, deep_dives
- `TopicStatus` — queued, researching, completed, failed
- `FindingCategory` — deep_insight, trend, opportunity, experimental
- `FindingStatus` — new, approved, dismissed
- `ConfidenceLevel` — high, medium, speculative
- `ActionType` — research_submitted, finding_viewed, finding_approved, finding_dismissed, pin_added, pin_removed, followup_asked

---

### 2. `backend/app/config.py`
**Action:** Rewritten (clean overwrite)

- `BaseSettings` class using `pydantic-settings`
- Fields: `supabase_url`, `supabase_anon_key`, `supabase_service_role_key`, `gemini_api_key`, `redis_url` (default: `redis://localhost:6379/0`)
- Loads from `.env` via `SettingsConfigDict`
- Exports singleton: `settings = Settings()`

---

### 3. `backend/app/main.py`
**Action:** Rewritten (clean overwrite)

- FastAPI app titled `"Humantic AI"`, version `"0.1.0"`
- `CORSMiddleware` allowing `http://localhost:5173`, all methods/headers, credentials
- Registers 6 routers:
  - `auth` → `/api/auth`
  - `onboarding` → `/api`
  - `research` → `/api`
  - `findings` → `/api`
  - `pins` → `/api`
  - `ws` → no prefix
- Root `GET /` returns `{"status": "ok", "message": "Humantic AI is running"}`

---

### 4. `backend/app/routers/findings.py`
**Action:** Written from stub (52 bytes → full implementation)

Three routes:
- `GET /findings` — fetches all user findings; supports optional `?topic_id=` and `?category=` query filters; orders by `created_at DESC`
- `GET /findings/{finding_id}` — fetches single finding by ID, scoped to current user; returns 404 if not found
- `PATCH /findings/{finding_id}` — updates `status` field; only allows `"approved"` or `"dismissed"` (validated before DB call); returns 400 if invalid value

---

### 5. `backend/app/routers/pins.py`
**Action:** Written from stub (52 bytes → full implementation)

Three routes:
- `POST /pins` — inserts new pinned interest with `uuid4` ID, `is_active=True`
- `GET /pins` — returns all active pins for user (`is_active=True`), ordered newest first
- `DELETE /pins/{pin_id}` — **soft delete**: sets `is_active=False` instead of hard deleting (preserves history for future M7 pattern recognition)

---

### 6. `backend/app/routers/ws.py`
**Action:** Written from stub (52 bytes → full implementation)

- In-memory `active_connections` dict mapping `user_id → list[WebSocket]`
- `push_to_user(user_id, data)` — async helper; importable by Celery tasks to push findings in real-time; auto-cleans dead connections
- `GET /ws/findings?token=...` — WebSocket endpoint; authenticates via `token` query param (WS clients cannot send custom headers); closes with code `1008` on invalid token; listens indefinitely until disconnect

---

### 7. `backend/app/services/gemini.py`
**Action:** New file

- Initialises `google-generativeai` with `gemini_api_key` from settings
- `call_gemini(prompt)` — raw single call, returns response text
- `build_subtopic_prompt(...)` — generates prompt to break a topic into 5-8 subtopics; injects user domain, depth preference, and pinned interests
- `build_research_prompt(...)` — generates prompt to research a single subtopic deeply; requests JSON findings with category, confidence, sources, why_this
- `build_synthesis_prompt(...)` — generates prompt to synthesise multiple raw results into 5-10 de-duplicated, high-quality final findings

---

### 8. `backend/app/tasks/celery_app.py`
**Action:** New file

- Celery instance named `"humantic"` using Redis as both broker and backend
- Config: JSON serialization, UTC timezone, `task_track_started=True`, `task_acks_late=True`, `worker_prefetch_multiplier=1`
- `celery.autodiscover_tasks(["app.tasks"])` to auto-register tasks

---

### 9. `backend/app/tasks/research_task.py`
**Action:** New file

Core background pipeline task `run_research_pipeline(topic_id)`:

1. Fetches topic, user profile, and active pinned interests from Supabase
2. Updates topic status → `"researching"`
3. Calls Gemini to generate 5-8 subtopics
4. For each subtopic (up to 6): calls Gemini to research it, collects raw results (1s delay between calls to avoid rate limits)
5. Calls Gemini to synthesise raw results into structured findings
6. Saves all findings to `findings` table with `uuid4` IDs
7. Updates topic status → `"completed"`, `cycles_completed=1`
8. On any failure: updates topic status → `"failed"` with error message; retries up to 2 times

---

### 10. `backend/app/tasks/__init__.py` + `backend/app/tasks/scheduler.py`
**Action:** New files

- `__init__.py` — exports `celery` instance and `run_research_pipeline` task
- `scheduler.py` — Celery Beat schedule:
  - `retry-failed-topics-every-hour` — runs every 3600s
  - `refresh-pinned-interests-every-6h` — runs every 21600s

---

### 11. `backend/app/routers/research.py`
**Action:** Modified (added Celery trigger)

Added import of `run_research_pipeline` from `app.tasks.research_task`.

In `POST /research`: after successful Supabase insert, calls `run_research_pipeline.delay(topic["id"])` to enqueue the background research task. Returns the saved topic immediately (non-blocking).

---

### 12. `backend/app/services/logger.py`
**Action:** New file

- `log_interaction(user_id, action_type, metadata)` — Async helper to record user behavior in the `interaction_logs` table.
- Foundation for future Behavioral Pattern Recognition (M7).

---

### 13. Router Integrations (Logging)
**Action:** Modified `research.py`, `findings.py`, `pins.py`, and `onboarding.py`

- **Research**: Logs `research_submitted` with topic details.
- **Findings**: Logs `finding_approved` / `finding_dismissed` with finding and topic IDs.
- **Pins**: Logs `pin_added` / `pin_removed` with pin descriptions.
- **Onboarding**: Logs `onboarding_complete` with the user's selected domain.

---

## Current Backend Status

| File | Status |
|------|--------|
| `app/config.py` | ✅ Complete |
| `app/main.py` | ✅ Complete |
| `app/deps.py` | ✅ Complete |
| `app/models/enums.py` | ✅ Complete |
| `app/models/schemas.py` | ✅ Complete |
| `app/models/__init__.py` | ✅ Complete |
| `app/services/supabase.py` | ✅ Complete |
| `app/services/gemini.py` | ✅ Complete |
| `app/routers/auth.py` | ✅ Complete |
| `app/routers/onboarding.py` | ✅ Complete |
| `app/routers/research.py` | ✅ Complete |
| `app/routers/findings.py` | ✅ Complete |
| `app/routers/pins.py` | ✅ Complete |
| `app/routers/ws.py` | ✅ Complete |
| `app/tasks/celery_app.py` | ✅ Complete |
| `app/tasks/research_task.py` | ✅ Complete |
| `app/tasks/scheduler.py` | ✅ Complete |
| `app/tasks/__init__.py` | ✅ Complete |

## Next Steps (Frontend — on hold)
- `frontend/src/index.css` — design system
- `frontend/src/context/AuthContext.jsx` — auth state
- `frontend/src/services/api.js` — Axios instance
- `frontend/src/App.jsx` — routing
- Pages: Landing, Login, Signup, Onboarding, Dashboard, FindingPage, PinnedInterests
