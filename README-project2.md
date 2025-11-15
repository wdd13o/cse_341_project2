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

Notes
- Validation uses Joi; POST/PUT will return 400 on invalid payloads.
- The books.authorId field should be set to the ObjectId string of an existing author.
- Swagger UI is available at /api-docs when the swagger.json has been generated.
