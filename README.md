# Session Tracker

A simple Node.js application to track and manage your kitesurf sessions.

## Features

- User authentication with login and registration system
- Secure password hashing with bcrypt
- Log kitesurf session details (location, kite, duration, max jump height)
- View all sessions in a modern card-based grid layout with dark theme
- Update existing sessions
- Delete sessions
- User-friendly session numbering (hides UUID complexity)
- Session management with secure logout
- **User Settings:**
  - Manage personal quiver (collection of kites)
  - Add and remove kites from quiver
  - Update email address
  - Kite selection from personal quiver when logging sessions

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
    authController.js
frontend/
    index.html
    login.html
    style.css
    images/
middleware/
    auth.js
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
   SESSION_SECRET=your-secret-key-change-in-production
   ```
   **Note:** 
   - Replace `192.168.1.49` with your Raspberry Pi's IP address, or use `http://localhost:8000` if running DynamoDB Local on the same machine.
   - Replace `SESSION_SECRET` with a secure random string for session encryption.

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

### 6. Create the required tables

**Sessions table:**
```sh
aws dynamodb create-table \
  --table-name Sessions \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```

**Users table (for authentication):**
```sh
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions AttributeName=user_id,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```

**Note:** The users table schema includes:
- `user_id` (String) - Unique UUID for the user (primary key)
- `email` (String) - User's email address (must be unique)
- `password` (String) - Bcrypt hashed password
- `account_created` (String) - UK date/time when account was created
- `last_logon` (String) - UK date/time of last successful login
- `quiver` (List) - Array of kite names owned by the user

The registration process automatically generates a UUID for `user_id` and initializes all fields. Sessions are linked to users via this UUID, so changing your email address doesn't affect your session history.

**Important:** If you have an existing users table with email as the primary key, you'll need to recreate it:
```sh
# Delete old table
aws dynamodb delete-table \
  --table-name users \
  --endpoint-url http://localhost:8000 \
  --region us-east-1

# Recreate with new structure
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions AttributeName=user_id,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```

After recreating the table, all users will need to register again. Their old sessions will remain in the Sessions table but won't be accessible until they create a new account.

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
- `.env` file configured with DynamoDB Local endpoint and SESSION_SECRET
- DynamoDB Local running in Docker (on Raspberry Pi or local machine)
- Sessions and users tables created in DynamoDB Local
- At least one user account in the users table

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
4. You will be redirected to the login page. Enter your credentials to access the session tracker.

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
4. You will be redirected to the login page. Enter your credentials to access the session tracker.

The backend server will:
- Run on port 3000
- Serve the frontend HTML/CSS files automatically
- Handle all API endpoints for session management and authentication
- Connect to DynamoDB Local running on your Raspberry Pi (or local machine)
- Manage user sessions with express-session

**Note:** Do not use `python -m http.server` to serve the frontend - it won't handle the API endpoints. Always use `node index.js` to run the complete application.

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email and password
- `POST /auth/register` - Register a new user account
- `POST /auth/logout` - Logout current user
- `GET /auth/check` - Check authentication status

### User Settings (Protected - requires authentication)
- `GET /auth/quiver` - Get user's quiver (list of kites)
- `POST /auth/quiver` - Add a kite to quiver
- `DELETE /auth/quiver` - Remove a kite from quiver
- `PUT /auth/email` - Update user's email address

### Sessions (Protected - requires authentication)
- `GET /sessions` - List all sessions for logged-in user
- `POST /sessions` - Create a new session
- `GET /sessions/:id` - Get a specific session
- `PUT /sessions/:id` - Update a session
- `DELETE /sessions/:id` - Delete a session

## Password Security with bcrypt

Passwords are automatically hashed using bcrypt with 10 salt rounds during registration. The system:

1. Hashes passwords on registration
2. Compares hashed passwords during login
3. Updates `last_logon` timestamp on successful login
4. Tracks `account_created` timestamp for each user

All password operations use bcrypt's built-in functions for secure authentication.

## Using the Application

1. **Registration:** Visit the login page and click "Register" to create a new account with your email and password.

2. **Login:** Enter your credentials on the login page. After successful login, you'll be redirected to the main session tracker.

3. **Managing Your Quiver:**
   - Click the settings icon (⚙️) in the top right
   - Add kites to your quiver by entering the kite name (e.g., "North Reach 11m")
   - Remove kites by clicking the "Remove" button next to each kite
   - Your quiver is saved to your user account

4. **Logging Sessions:**
   - Expand the "Add Session" section
   - Select a kite from your quiver dropdown
   - Enter location, duration, and max jump height
   - Sessions are automatically associated with your user account

5. **Viewing Sessions:**
   - Click "Fetch Sessions" to load your personal sessions
   - Only your sessions are displayed (user-specific filtering)

6. **Updating Email:**
   - Open settings (⚙️ icon)
   - Enter your new email address
   - Your email is updated while maintaining all your sessions and quiver data

## Technologies Used

- Node.js
- Express
- express-session (session management)
- DynamoDB (via AWS SDK)
- Joi (validation)
- Morgan (logging)
- dotenv (environment variables)
- bcrypt (optional, for password hashing)

## License

ISC

## Author

stuskeer
