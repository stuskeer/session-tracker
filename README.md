# Session Tracker

A simple Node.js application to track and manage your kitesurf sessions.

## Features

- Log session details
- View session history
- Edit and delete sessions

## Project Structure

```
core.29883
Dockerfile
index.js
package.json
README.md
session_database.tf
terraform-fix.txt
terraform.tfstate
controllers/
	sessionController.js
frontend/
	index.html
	style.css
	images/
models/
	session.js
services/
	database.js
views/
	router.js
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/stuskeer/session-tracker.git
   cd session-tracker
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. (Optional) Copy and edit the `.env` file if environment variables are required:
   ```sh
   cp .env.example .env
   # Edit .env as needed
   ```

## Usage

### Development

Start the server in development mode (with nodemon):
```sh
npm run dev
```

### Production

Start the server in production mode:
```sh
npm run prod
```

The backend will run on the default port (e.g., 3000). The frontend can be accessed via `frontend/index.html`.

## API Endpoints

- `GET /sessions` - List all sessions
- `POST /sessions` - Create a new session
- `PUT /sessions/:id` - Update a session
- `DELETE /sessions/:id` - Delete a session

## Technologies Used

- Node.js
- Express
- DynamoDB (via AWS SDK)
- Joi (validation)
- Morgan (logging)
- dotenv (environment variables)

## License

ISC

## Author

stuskeer