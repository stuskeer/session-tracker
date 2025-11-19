# Session Tracker

A simple Node.js application to track and manage your kitesurf sessions.

## Features

- Log kitesurf session details (location, kite, max jump height)
- View all sessions in a card-based grid layout
- Update existing sessions
- Delete sessions
- User-friendly session numbering (hides UUID complexity)

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
3. Create a `.env` file in the root directory with your AWS credentials:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

## Running on Your PC

### Prerequisites
- Node.js installed (v18 or later)
- AWS credentials configured in `.env` file
- DynamoDB table set up (see `session_database.tf`)

### Windows (PowerShell)
1. Set environment variables (or use `.env` file):
   ```powershell
   $env:AWS_REGION="us-east-1"
   ```
2. Start the backend server:
   ```powershell
   node index.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Linux/Mac
1. Set environment variables (or use `.env` file):
   ```sh
   export AWS_REGION=us-east-1
   ```
2. Start the backend server:
   ```sh
   node index.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

The backend server will:
- Run on port 3000
- Serve the frontend HTML/CSS files automatically
- Handle all API endpoints for session management
- Connect to your DynamoDB database

**Note:** Do not use `python -m http.server` to serve the frontend - it won't handle the API endpoints. Always use `node index.js` to run the complete application.

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