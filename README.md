# cse_341_project1

## Project 2: Books & Authors API

This Node.js API provides CRUD operations for two MongoDB collections:
- **authors**: `/authors` (7+ fields)
- **books**: `/books` (references authors)

### Setup
1. Copy `.env.example` to `.env` and set your MongoDB connection string.
2. Install dependencies:
	```powershell
	npm install
	```
3. Start the server:
	```powershell
	node server.js
	```
4. Test endpoints using VS Code REST client (`project2.rest`), Postman, or curl.

### API Documentation
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Deployment
- Add your MongoDB connection string as a config var in Render.

### Security
- Never commit `.env` with credentials. `.gitignore` is set up to exclude it.

### Submission
- See Canvas for rubric and required links (GitHub, Render, YouTube demo).