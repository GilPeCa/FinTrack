# FinTrack — Client-only MVP (Expense Tracker)

FinTrack is a lightweight, client-only personal finance MVP that runs entirely in the browser. Data is stored in the user's localStorage so no backend is required to try the app.

Quick highlights
- Frontend: React (single-file, no build required)
- Storage: browser localStorage (no server / no auth)
- Features:
  - FT-001: Register Transactions (Ingreso / Gasto) — amount, description, date, category
  - FT-002: Manage Categories — create / list / delete categories
  - FT-003: View Transaction History — edit / delete transactions
  - FT-004: Dashboard Summary — Total Income, Total Expenses, Current Balance

Files created
- frontend/index.html — Full client-only React app (open directly in browser)
- backend/ (optional) — FastAPI example kept for reference (not required for client-only mode)
  - backend/app.py
  - backend/requirements.txt
  - backend/.env.example
- supabase/schema.sql — SQL for an equivalent server-backed setup (optional)

How to run (client-only)
1. Open `FinTrack/frontend/index.html` in a modern browser (double-click the file or open it with the browser).
2. The app runs immediately and stores data in localStorage keys:
   - fintrack_categories_v1
   - fintrack_transactions_v1
3. No network or backend configuration is required.

Notes about server-backed option (optional)
- A backend & Supabase schema were scaffoled under `backend/` and `supabase/schema.sql` in case you later want to switch to server storage.
- The client-only app does not use Supabase or the backend by default.

Design & constraints
- This MVP is intentionally simple: no authentication, single-user local storage, no external dependencies to run.
- For production or multi-device sync, connect frontend to a backend (FastAPI + Supabase) and replace localStorage calls with API requests.

Development checklist
- [x] Analyze requirements
- [x] Implement client-only frontend (single-file React app)
- [x] Provide optional backend scaffold and Supabase schema
- [x] Document run instructions for client-only mode

If you want the app to persist remotely (Supabase) or to add charts (Recharts), I can update the frontend to call the existing backend endpoints or integrate Supabase directly.


//cha