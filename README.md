# Fill Tests - Backend

Backend API for a test platform, built with NestJS and Prisma.

## How to run

```bash
docker compose up --build
```

This will start the database and the API automatically. Migrations run on startup.

## Routes

Protected routes require the header `Authorization: Bearer <token>`.

### Auth

| Method | Route          | Protected | Description    |
|--------|----------------|-----------|----------------|
| POST   | /auth/login    | No        | User login     |

**Body POST /auth/login:**
```json
{ "email": "email@email.com", "password": "123456" }
```

### Users

| Method | Route           | Protected | Description              |
|--------|-----------------|-----------|--------------------------|
| POST   | /users          | No        | Create user              |
| GET    | /users          | No        | List all users           |
| GET    | /users/:id      | No        | Get user by id           |
| PATCH  | /users          | Yes       | Update logged in user    |
| DELETE | /users          | Yes       | Delete logged in user    |
| POST   | /users/forget   | No        | Request password reset   |
| PATCH  | /users/reset    | No        | Reset password           |

**Body POST /users:**
```json
{ "name": "Name", "email": "email@email.com", "password": "123456" }
```

### Questions

| Method | Route            | Protected | Description              |
|--------|------------------|-----------|--------------------------|
| POST   | /questions       | Yes       | Create question          |
| GET    | /questions       | No        | List all questions       |
| GET    | /questions/:id   | No        | Get question by id       |
| PATCH  | /questions/:id   | Yes       | Update question          |
| DELETE | /questions/:id   | Yes       | Delete question          |

**Body POST /questions:**
```json
{
  "description": "What is the result of 2 + 2?",
  "subject": "Math",
  "alternatives": [
    { "description": "3", "isCorrect": false },
    { "description": "4", "isCorrect": true },
    { "description": "5", "isCorrect": false },
    { "description": "6", "isCorrect": false },
    { "description": "7", "isCorrect": false }
  ]
}
```

The question `userId` is automatically obtained from the logged in user's token.

Only the creator of the question can update or delete it.
