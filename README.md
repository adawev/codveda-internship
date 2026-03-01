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
- WebSocket authentication is JWT-based and topic subscriptions are authorized per role.

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
- CORS is explicit and wildcard origin is blocked when credentials are enabled.
- OSIV is disabled.

