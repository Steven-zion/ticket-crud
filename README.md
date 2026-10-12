# Mini Ticket Tracker

Take-home assignment from Lodwar Services (Mid-Level FullStack Developer role).

## Tech Stack

- **Backend:** Node.js, Express, Prisma, PostgreSQL (hosted on Neon)
- **Frontend:** React, Vite, Tailwind CSS, TanStack Query
- **Testing:** Vitest, Supertest

## Overview

The project is split into two directories:
- `ticket-server`: Express REST API connecting to Neon Postgres, handling CRUD, validation, aggregation stats, and integration tests.
- `ticket-client`: Vite React single-page app displaying tickets, filters, search and action modals.

## Getting Started

### 1. Server Setup (`ticket-server`)

```bash
cd ticket-server
npm install
cp .env.example .env
```

Make sure your `DATABASE_URL` is configured in `.env` (pointing to the Neon Postgres instance).

Run Prisma setup and start the server:
```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API will be available at `http://localhost:3212`.

### 2. Client Setup (`ticket-client`)

In a separate terminal:
```bash
cd ticket-client
npm install
npm run dev
```

The app will run locally at `http://localhost:5173`.

## Running Tests

Integration tests cover the core endpoints (creating tickets, stats aggregation, filtering, updating, deleting and validation)

```bash
cd ticket-server
npm test
```

## API Summary

All endpoints are prefixed with `/api/v1`:

- `POST /tickets` — Create a ticket (`title`, optional `description`, `priority`, `status`)
- `GET /tickets` — List tickets with pagination (`?page=&limit=`), `?status=`, `?priority=`, and `?search=`
- `GET /tickets/stats` — Ticket counts grouped by status
- `PATCH /tickets/:id` — Update ticket status or priority
- `DELETE /tickets/:id` — Remove a ticket

## Decisions & Tradeoffs

For the ticket IDs, I decided against long 36-character UUIDs and raw auto-incrementing numbers in favor of 6-character uppercase alphanumeric IDs (e.g. `9F4B21`) with a collision check. This keeps the IDs short, clean in URLs and easy to reference during support workflows. 

On the frontend, I used TanStack Query for server state instead of pulling in Redux, which would have been overkill for this scope. I added a 250ms debounce to the search input and paired it with `keepPreviousData` so typing and filtering update smoothly without full-page loading flickers.

What i would add if the "over-building" mandate was lifted:
- role based authentication: admin,staff and end-user
- audit logs for each ticket (who did what and when)
- email notifications for ticket updates
- file attachments for tickets to attach screenshots and other files


