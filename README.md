# CodVeda Internship Project

Full-stack e-commerce project (`React + Spring Boot + PostgreSQL`).

## 1) Run Locally (quick start)

### Prerequisites
- Java 17+
- Node.js 18+
- npm 9+
- PostgreSQL 14+

### 1. Configure environment variables
Create a `.env` file in the root by copying `.env.example`:

```bash
cp .env.example .env
```

Minimum required variables:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_JWT_SECRET`
- `APP_ADMIN_PASSWORD`
- `REACT_APP_API_BASE_URL` (`http://localhost:8080`)

### 2. Start backend
```bash
cd backend
export $(grep -v '^#' ../.env | xargs)
./mvnw spring-boot:run
```

Backend: `http://localhost:8080`

### 3. Start frontend
In a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000`

## 2) Project overview

This project includes:
- JWT authentication (`access token`) and `HttpOnly refresh cookie`
- `USER` and `ADMIN` role-based access
- Product, cart, order, and user modules
- Admin panel (`/admin`)
- Real-time order status updates (`WebSocket/STOMP`)
- Flyway migrations for database schema management
- Swagger/OpenAPI (`/swagger-ui/index.html`)
- Automated tests for frontend and backend

## 3) Tech stack

- Frontend: React, React Router, Axios, TailwindCSS
- Backend: Spring Boot 3, Spring Security, Spring Data JPA, Flyway, WebSocket, JWT
- Database: PostgreSQL

## 4) API and routing

- Auth: `/api/auth/*`
- Products: `/api/products/*`
- Cart: `/api/cart/*`
- Orders: `/api/orders/*`, admin endpoint `/api/orders/admin`
- Users: `/api/users/*`
- WebSocket endpoints: `/ws` (SockJS), `/ws-simple`

## 5) Tests

Backend:
```bash
cd backend
./mvnw test
```

Frontend:
```bash
cd frontend
npm test -- --watchAll=false
```

## 6) Project structure

- `backend/` - Spring Boot REST API
- `frontend/` - React app
- `.env.example` - environment template

## 7) Online demo

You can view the live project at:

`https://codveda.diyorjon.com`

## 8) Deployment (production)

- Frontend is deployed on `Netlify`.
- Backend is deployed on your own server.
- `Nginx` is used as a reverse proxy for the backend service.
- Production domain: `https://codveda.diyorjon.com`
