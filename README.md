# fuzzy_auth

A lightweight authentication service built with Node.js, Express, and MongoDB. Supports user registration and login with JWT-based sessions.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Setup

```bash
npm install
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
```

### Running

```bash
npm start
```

## API

### Register

**POST** `/auth/register`

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Secret123"
}
```

Returns `201` with a JWT and the created user object.

---

### Login

**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Secret123"
}
```

Returns `200` with a JWT and the user object.

## Tests

```bash
npm test
```
