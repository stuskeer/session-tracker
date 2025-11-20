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
- Docker installed on your Raspberry Pi
- DynamoDB Local running in Docker (on Raspberry Pi or local machine)

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

3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   AWS_ACCESS_KEY_ID=dummy
   AWS_SECRET_ACCESS_KEY=dummy
   DYNAMODB_REGION=us-east-1
   DYNAMODB_ENDPOINT=http://192.168.1.49:8000
   ```
   **Note:** Replace `192.168.1.49` with your Raspberry Pi's IP address, or use `http://localhost:8000` if running DynamoDB Local on the same machine.

## Setting up DynamoDB Local on Raspberry Pi (Docker)

### 1. Install Docker

If Docker isn't already installed on your Pi:
```sh
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
```

Add your user to the Docker group (so you don't need sudo every time):
```sh
sudo usermod -aG docker $USER
```
Log out and back in for this to take effect.

### 2. Pull the DynamoDB Local image

```sh
docker pull amazon/dynamodb-local
```

### 3. Run DynamoDB Local container

**Basic run (no persistence):**
```sh
docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local
```

**Run with persistent storage (recommended):**
```sh
docker run -d --name dynamodb-local \
  -p 8000:8000 \
  -v ~/dynamodb-data:/home/dynamodblocal/data \
  amazon/dynamodb-local \
  -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data
```

**Options explained:**
- `-d` runs in background
- `--name dynamodb-local` gives the container a friendly name
- `-p 8000:8000` maps port 8000 on the Pi to port 8000 inside the container
- `-v ~/dynamodb-data:/home/dynamodblocal/data` mounts a local folder for persistence
- `-dbPath` tells DynamoDB Local to store its data in that folder

This ensures your tables and data survive container restarts.

### 4. Verify it's running

```sh
docker ps
```
You should see `amazon/dynamodb-local` listed.

### 5. Test the endpoint

From your Pi or another machine on the same network:
```sh
curl http://192.168.1.49:8000
```
Replace `192.168.1.49` with your Pi's IP. If successful, you'll get a JSON response.

### 6. Create the Sessions table

Example using AWS CLI:
```sh
aws dynamodb create-table \
  --table-name Sessions \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```
This sets up the Sessions table locally.

### 7. Connect your app

Ensure your `.env` file points to the Pi's DynamoDB Local endpoint:
```env
PORT=3000
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
DYNAMODB_REGION=us-east-1
DYNAMODB_ENDPOINT=http://192.168.1.49:8000
```
Replace `192.168.1.49` with your Pi's IP address, or use `http://localhost:8000` if running on the same machine.

## Running on Your PC

### Prerequisites
- Node.js installed (v18 or later)
- `.env` file configured with DynamoDB Local endpoint
- DynamoDB Local running in Docker (on Raspberry Pi or local machine)
- Sessions table created in DynamoDB Local

### Windows (PowerShell)

1. Ensure DynamoDB Local is running on your Raspberry Pi or local machine
2. Start the backend server:
   ```powershell
   node index.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Linux/Mac

1. Ensure DynamoDB Local is running on your Raspberry Pi or local machine
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
- Connect to DynamoDB Local running on your Raspberry Pi (or local machine)

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
