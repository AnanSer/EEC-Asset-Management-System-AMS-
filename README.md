# EEC Enterprise Asset Management System

## Project Overview

Ethiopian Engineering Corporation (EEC) Enterprise Asset Management System built with a modern tech stack.

## Monorepo Structure

```
EEC-EAMS/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
├── backend/           # Express + TypeScript + Prisma
└── docs/             # Documentation
```

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind   |
| Backend    | Express, TypeScript                |
| Database   | PostgreSQL + Prisma ORM            |
| Icons      | Lucide React                       |
| Font       | Inter (Google Fonts)               |

## Brand Colors

| Token       | Hex       | Usage                     |
|-------------|-----------|---------------------------|
| Primary     | #083D4A   | Sidebar, headers          |
| Accent      | #00A7D6   | Active icons, links       |
| Active      | #C96F59   | Active sidebar border     |
| Background  | #F4F8FA   | Page background           |
| Card        | #FFFFFF   | Card surfaces             |
| Text        | #1E293B   | Body text                 |

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

## Phase Roadmap

- **Phase 1** ✅ – Project structure, UI layout, empty pages, dashboard placeholders
- **Phase 2** – Database models, API endpoints, authentication
- **Phase 3** – Asset CRUD, assignments, departments
- **Phase 4** – Maintenance workflows, testing module
- **Phase 5** – Reports, notifications, analytics
