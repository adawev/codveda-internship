# CodVeda Internship Project (React + Spring Boot)

Production-oriented full-stack e-commerce platform with JWT auth, refresh-token rotation, role-based access control, REST APIs, WebSocket live updates, validation hardening, and automated tests.

## Project Structure

- `backend/` - Java Spring Boot API (REST, security, persistence, WebSocket)
- `frontend/` - React client application
- `.env.example` - Required environment variables for local/dev/prod setup

## Core Features

- Authentication and authorization
- JWT access token + refresh token rotation via HttpOnly cookie
- Role-based access control (USER/ADMIN) on backend and frontend routes
- Product, user, cart, and order CRUD APIs
- Server-side product pagination/filtering/sorting
- Real-time order status updates with STOMP over WebSocket
- Global API error handling with consistent schema
- DTO + business validation hardening
- Rate limiting on auth endpoints

## Architecture Overview

- Frontend consumes backend REST APIs through a shared Axios abstraction (`frontend/src/services/api.js`).
- Backend uses layered architecture: controller -> service -> repository -> DB.
- Controllers expose DTOs only (no JPA entities leaked).
- Error responses use a global exception handler and consistent `ApiError` schema.
- Success responses use a consistent `ApiResponse<T>` wrapper.
- Refresh tokens are persisted and rotated to reduce replay risk.
- Refresh tokens use token-family tracking with replay detection; reuse of a rotated token revokes the full family.
- WebSocket authentication is JWT-based and topic subscriptions are authorized per role.
- Auth rate limiting uses a pluggable store abstraction for distributed limiter backends.
- Product search uses PostgreSQL `ILIKE` with trigram indexes for scalable text search.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (dev/prod)

## Database Setup

1. Create a PostgreSQL database.
2. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
3. Flyway migrations run automatically on app start (`V1`, `V2`).

## Environment Variables

Copy `.env.example` and set values for your environment.

- Backend reads variables from environment.
- Frontend reads `REACT_APP_API_BASE_URL`.

## Run Backend

```bash
cd backend
export $(grep -v '^#' ../.env.example | xargs) # optional helper for local shell
./mvnw spring-boot:run
```

Default backend URL: `http://localhost:8080`

## Run Frontend

```bash
cd frontend
npm install
npm start
```

Default frontend URL: `http://localhost:3000`

## Tests

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm test -- --watchAll=false
```

## Security Notes

- Access token is held in memory on client.
- Refresh token is HttpOnly cookie.
- `secure=true` for refresh cookie in production profile.
- Refresh cookie uses `SameSite=Strict` and path scoping to `/api/auth`.
- CORS is explicit and wildcard origin is blocked when credentials are enabled.
- OSIV is disabled.
- WebSocket auth accepts only non-expired `token_type=access` JWTs.
- Refresh replay protection:
  - each login creates a refresh token family
  - refresh rotation keeps the same family
  - reuse of a rotated token revokes the full family and blocks future refreshes in that family

## CSRF Strategy

Refresh is cookie-based and only available at `POST /api/auth/refresh`. CSRF is mitigated by:
- `SameSite=Strict` refresh cookie (cross-site requests do not include the cookie),
- HttpOnly cookie with narrow auth path scope (`/api/auth`),
- strict explicit CORS origins with credentials and wildcard origin rejection.

Given these controls and the non-browser storage model for access tokens, a double-submit token is not required for this internship-scale architecture.
