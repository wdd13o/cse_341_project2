Project 2 (Books & Authors) - Quick Notes

This workspace adds a small Project 2 API inside the existing repo. It provides two collections:

- authors: CRUD operations at /authors
- books: CRUD operations at /books (books reference authors by authorId)

Requirements
- A running MongoDB and MONGODB_URL set in environment (see .env.example)
- Server runs on PORT (default 3000)

How to use
1. Install dependencies (if not already):
   npm install

2. Start the server:
   node server.js
   or for development:
   npm run dev (if nodemon is installed/setup)

3. Use the provided `project2.rest` file with VS Code REST client or curl/Postman to exercise the endpoints.

Authentication
- The project supports Google OAuth. Start the flow by visiting `/auth/google` on your deployed site (for example `https://cse-341-project2-1dsv.onrender.com/auth/google`).
- After signing in you will be redirected to `/auth/success` with a `token` query parameter. Copy the token and use it in Swagger or API clients as `Authorization: Bearer <token>`.
- Protected endpoints (POST/PUT/DELETE for `/authors` and `/books`) require a valid JWT.
Authentication
- The project supports Google OAuth and local username/password registration.
- To register locally: `POST /auth/register` with JSON `{ "email": "you@example.com", "password": "secret" }`.
- To login locally: `POST /auth/login` with the same JSON; response includes `token`.
- To use Google OAuth: visit `/auth/google` on your deployed site (for example `https://cse-341-project2-1dsv.onrender.com/auth/google`). After sign-in you'll be redirected to `/auth/success?token=...`.
- In Swagger UI click "Authorize" and enter `Bearer <token>` to call protected endpoints.

Demo checklist (short)
- Show GET `/authors` and GET `/books` (no auth required).
- Register or login to obtain a JWT (local `/auth/login` or Google `/auth/google`).
- Use Swagger's Authorize with `Bearer <token>` and demonstrate POST `/authors` and POST `/books`.
- Demonstrate PUT and DELETE on a created book.

Notes
- Validation uses Joi; POST/PUT will return 400 on invalid payloads.
- The books.authorId field should be set to the ObjectId string of an existing author.
- Swagger UI is available at /api-docs when the swagger.json has been generated.

Environment variables
- **MONGODB_URL**: MongoDB connection string (e.g. `mongodb://localhost:27017/cse_341_project1`)
- **JWT_SECRET**: Secret used to sign JWTs (set to a strong random value in production)
- **GOOGLE_CLIENT_ID**: Google OAuth client ID (optional; required for Google sign-in)
- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret (optional; required for Google sign-in)
- **GOOGLE_CALLBACK_URL**: OAuth callback URL (optional - defaults to deployed host path)
- **PORT**: Port the server listens on (default `3000`)

Quick local setup example (PowerShell):
```
$env:MONGODB_URL = "mongodb://localhost:27017/cse_341_project1";
$env:JWT_SECRET = "CHANGE_ME_TO_A_STRONG_SECRET";
node server.js
```

Automated test script
- There's a small PowerShell script at `scripts/auth_test.ps1` that demonstrates register -> login -> protected POST.
- Run it from PowerShell while the server is running locally:
```powershell
# start the server in a separate terminal (if not running already)
# node server.js
.\scripts\auth_test.ps1
```
