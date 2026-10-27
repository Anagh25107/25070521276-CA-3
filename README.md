# FixMyCampus

A modular campus issue-reporting and maintenance workflow application built with **React + Vite**, **Node.js + Express**, and **MongoDB**. Cookie-based sessions and server-enforced RBAC are implemented; this is an academic localhost project, not a production security certification.

## Requirements
- Node.js 20+ and npm
- Local MongoDB running at `mongodb://127.0.0.1:27017` (or a dedicated local URI)

## Run locally
1. Copy `.env.example` to `server/.env` and edit the values. Use a long random `SESSION_SECRET`; change the bootstrap password.
2. Install dependencies: `npm install`, then `npm run install:all`.
3. Start MongoDB.
4. Create the first admin once: `npm run seed:admin --prefix server`. The command reads credentials from `server/.env`, refuses a weak/default password, and is repeatable without creating duplicate admins.
5. Start app: `npm run dev`. Open `http://localhost:5173`.
6. Register a student account from the UI. Admin can create staff accounts from Users.

## Security design
- **Authentication** establishes identity; **authorization** decides which operations that identity may perform.
- **RBAC**: Student, Maintenance Staff, Administrator. Public registration hardcodes Student on the server and ignores any submitted role.
- Passwords use bcryptjs (12 rounds); password hashes are excluded from responses.
- `express-session` stores opaque session IDs in HttpOnly cookies; `connect-mongo` stores sessions in MongoDB. The session ID is regenerated at login and destroyed at logout. Secure cookies turn on in production; SameSite=Lax is used for the local same-origin setup.
- State-changing API calls require a CSRF token returned by `/api/v1/auth/csrf`; the frontend sends it in `X-CSRF-Token`. CORS allows only `CLIENT_ORIGIN` and credentials.
- `requireAuth`, `requireRole`, issue ownership checks, and staff assignment/team checks run on the server. UI visibility is only a usability feature, not a security boundary.
- Inactive users are denied on each protected request. Admin operations prevent demoting/deactivating the last active administrator.
- Login has rate limiting, generic credential errors, input validation, and consistent JSON error responses.

## Roles
- **Student**: public issue feed/details with reporter email hidden; create issues; see own submissions and history; can edit/withdraw only while Reported.
- **Maintenance Staff**: see issues assigned directly or to their team; add notes, update allowed status, record resolution details.
- **Administrator**: manage all issues, assignment, priority, users, teams, and aggregate reports.

## API overview
Base path `/api/v1`. Authentication: `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`, `GET /auth/csrf`. Issues: `GET/POST /issues`, `GET/PATCH/DELETE /issues/:id`, `POST /issues/:id/notes`, admin issue assignment/status/priority via `PATCH /issues/:id/manage`. Admin: `GET/POST /admin/users`, `PATCH /admin/users/:id`, `GET/POST /admin/teams`, `GET /admin/reports`.

All mutating requests require a session and CSRF token (registration/login also use CSRF). See route files for exact payloads. API responses use `{ success, data, error }`.

## Tests
`npm test --prefix server` uses Node's test runner and an isolated test database URI. Set `TEST_MONGO_URI` to a dedicated database such as `mongodb://127.0.0.1:27017/fixmycampus_test`; tests refuse to run if it appears to target the ordinary development DB. The included starter tests currently cover password hashing/verification, the server-side registration-role rule, basic password/ObjectId validation, and the role enum. They are unit tests, not a complete end-to-end security suite. Before claiming all acceptance criteria are met, add and run isolated-MongoDB HTTP integration tests for login/logout/session cookies, CSRF, role enforcement, ownership/assignment, inactive users, last-admin protection, and rate limiting. Run with MongoDB available.

## Limitations / deployment notes
- This is an academic starter intended for localhost. Before public deployment, add HTTPS, reverse-proxy trust configuration, centralized security logging/alerting, operational backup/restore, dependency scanning, email verification/password reset, stronger account recovery, and a reviewed threat model.
- SameSite=Lax plus CSRF tokens are used; deployment across different sites may require a different cookie/CORS strategy and additional review.
- Rate limits are in-memory and reset on server restart; use a shared store in a multi-instance deployment.
- The seed password is supplied via environment, not hardcoded in source. Protect `.env` and never commit it.
