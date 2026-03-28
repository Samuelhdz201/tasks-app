# Tasks App — AppQuantika Technical Test

A REST API for a task management system with user authentication, PostgreSQL persistence, a Cloudflare Worker as edge proxy, and a React.js frontend.

## Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL 18
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Edge/Proxy:** Cloudflare Workers + jose
- **Testing:** Jest + Supertest
- **Frontend:** React.js + Tailwind CSS + Vite

---

## Prerequisites

- Node.js v22+
- PostgreSQL v18
- npm v11+
- Wrangler CLI (`npm install -g wrangler`)

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/tasks-app.git
cd tasks-app
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Install worker dependencies:
```bash
cd worker
npm install
cd ..
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```
```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=tasks_db
JWT_SECRET=your_super_secret_key_here
WORKER_BACKEND_URL=http://localhost:3000
```

For the Cloudflare Worker, create `worker/.dev.vars`:
```env
JWT_SECRET=your_super_secret_key_here
WORKER_BACKEND_URL=http://127.0.0.1:3000
```

---

## Database Setup

1. Create the database:
```bash
psql -U postgres -c "CREATE DATABASE tasks_db;"
```

2. Run migrations:
```bash
psql -U postgres -d tasks_db -f migration.sql
```

---

## Running the Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Running Tests
```bash
npm test
```

With coverage report:
```bash
npm run test:coverage
```

---

## Running the Cloudflare Worker

Make sure the backend is running, then in a separate terminal:
```bash
cd worker
npx wrangler dev
```

Worker runs on `http://127.0.0.1:8787`

---

## Running the Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Endpoints

### Auth

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"123456"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Tasks (require Bearer token)

#### List tasks
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### List tasks with filters
```bash
curl "http://localhost:3000/api/tasks?status=pending&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task description","status":"pending","due_date":"2026-04-01"}'
```

#### Get task by ID
```bash
curl http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update task
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","status":"in_progress"}'
```

#### Delete task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Project Structure
```
tasks-app/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── tasks.controller.ts
│   ├── db/
│   │   └── client.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── tasks.routes.ts
│   └── index.ts
├── worker/
│   ├── src/
│   │   └── index.ts
│   ├── .dev.vars
│   └── wrangler.json
├── tests/
│   ├── auth.test.ts
│   └── tasks.test.ts
├── frontend/
│   └── src/
│       ├── pages/
│       ├── services/
│       └── components/
├── migration.sql
├── .env.example
└── README.md
```