# Interview App

NestJS backend (`backend/`, SQLite via better-sqlite3) and a Next.js frontend (`frontend/`).

## Local development without Docker

Requirements: Node 20 (`nvm use` reads `.nvmrc`). Newer Node versions may have no prebuilt
`better-sqlite3` binary and will need Xcode command line tools to compile it.

### 1. Backend

```bash
cd backend
cp .env.example .env        # fill in OPENAI_API_KEY if you need AI grading
npm install
npm run start:dev           # http://localhost:5001/api, Swagger at /api/docs
```

The SQLite database is created at `backend/data/ai_interviews.db` on first start, with the
admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Voice uploads go to `backend/data/uploads`.

To work against real data, copy the production database down:

```bash
docker cp interviewapp_backend:/app/data/ai_interviews.db backend/data/ai_interviews.db   # on the server
scp <server>:/path/to/ai_interviews.db backend/data/                                      # then locally
```

Student login and student lists come from the ICBM backend at `SOURCE_API_URL`. Without it,
admin pages that only read the local database (interviews, question bank) still work.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

### Ports

macOS reserves port 5000 for AirPlay Receiver, so the backend runs on 5001 locally.
If you change `PORT`, update `NEXT_PUBLIC_API_URL` to match.

## Maintenance scripts (backend)

| Command | What it does |
| --- | --- |
| `npm run rescore` | Re-grade every response with the current grading rules |
| `npm run bonus` | Dry run: list failed interviews that would get +10 marks |
| `npm run bonus -- --apply` | Add +10 to the overall of every failed interview (backs up the DB first) |
| `npm run bonus -- --undo --apply` | Remove all bonus marks |

`bonus` options: `--marks=10`, `--pass-mark=70`, `--db=PATH`. It needs `npm run build` first.

On production, pipe the script into the running container:

```bash
docker exec -i interviewapp_backend node - < backend/scripts/add-bonus-marks.js            # dry run
docker exec -i interviewapp_backend node - --apply < backend/scripts/add-bonus-marks.js    # apply
```
