# Session Tracker

A modern Node.js application to track and manage your kitesurf sessions with a clean, data-focused interface.

## Features

- **User Authentication:** Secure login and registration system with bcrypt password hashing
- **Session Management:** Log kitesurf session details including:
  - Date (with UK format display and date picker)
  - Location
  - Kite used
  - Duration
  - Max jump height
- **Table View:** Clean, compact table layout displaying all session data at a glance
- **User Settings:**
  - Manage personal quiver (collection of kites)
  - Add and remove kites from quiver
  - Update email address
  - Kite selection from personal quiver when logging sessions
- **Insights Page:** Placeholder for future analytics and statistics
- **UUID-Based Architecture:** User sessions linked via UUID, allowing email changes without data loss
- **Session Security:** HTTP-only cookies and secure session management
- **Input Validation:** Comprehensive Joi validation to prevent SQL injection and ensure data integrity

## Project Structure

```
index.js                    # Main Express server
package.json               # Dependencies and scripts
.env                       # Environment configuration
controllers/
    sessionController.js   # Session CRUD operations
    authController.js      # Authentication and user management
frontend/
    index.html            # Main sessions page with table view
    login.html            # Login/registration page
    insights.html         # Insights page (placeholder)
    style.css             # Modern dark theme styling
    images/               # Logo and assets
middleware/
    auth.js               # Authentication middleware
models/
    session.js            # Session validation schemas (Joi)
    user.js               # User validation schemas (Joi)
services/
    database.js           # DynamoDB connection
views/
    router.js             # API route definitions
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
- `password` (String) - Bcrypt hashed password (10 salt rounds)
- `account_created` (String) - UK date/time when account was created
- `last_logon` (String) - UK date/time of last successful login
- `quiver` (List) - Array of kite names owned by the user

**Sessions table schema includes:**
- `id` (String) - Unique UUID for the session (primary key)
- `user_id` (String) - UUID linking to the user who created the session
- `date` (String) - Session date in YYYY-MM-DD format
- `location` (String) - Session location (max 200 chars)
- `kite` (String) - Kite name from user's quiver (max 100 chars)
- `duration` (String) - Session duration in HH:MM format
- `max_jump` (Number) - Maximum jump height in meters (0-100, 1 decimal place)

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

### Navigation
- **Sessions Page** (`/index.html`): Main page with table view of all your sessions
- **Insights Page** (`/insights.html`): Placeholder for future analytics features
- **Hamburger Menu** (top right): Access Insights, Settings, and Logout

### Getting Started

1. **Registration:** 
   - Visit `http://localhost:3000` (redirects to login page)
   - Click "Don't have an account? Register here"
   - Enter email and password (min 8 chars, mixed case + digit required)
   - After registration, switch back to login mode and sign in

2. **Login:** 
   - Enter your credentials on the login page
   - After successful login, you'll be redirected to the sessions table

3. **Managing Your Quiver:**
   - Click the hamburger menu (☰) in the top right
   - Select "Settings" (⚙️)
   - Add kites to your quiver by entering the kite name (e.g., "North Reach 11m")
   - Remove kites by clicking the "Remove" button next to each kite
   - Your quiver is saved to your user account in DynamoDB

4. **Logging Sessions:**
   - Expand the "Add Session" section on the main page
   - Fill in the form:
     - **Date:** Use the date picker (UK format display)
     - **Location:** Session location (letters, numbers, spaces, hyphens, commas)
     - **Kite:** Select from your quiver dropdown
     - **Duration:** Time in HH:MM format (default: 00:00)
     - **Max Jump:** Jump height in meters (0-100, 1 decimal place)
   - Click "Add Session"
   - Sessions are automatically associated with your user account

5. **Viewing Sessions:**
   - Click "Fetch Sessions" to load your personal sessions in a table
   - Table displays: Session ID, Date (UK format), Location, Kite, Duration, Max Jump
   - Only your sessions are displayed (user-specific filtering)
   - Hover over rows for visual feedback

6. **Updating Sessions:**
   - Expand the "Update Session" section
   - Enter the Session ID (number from the table)
   - Fill in only the fields you want to update
   - Click "Update Session"

7. **Deleting Sessions:**
   - Expand the "Delete Session" section
   - Enter the Session ID
   - Click "Delete Session"

8. **Updating Email:**
   - Open settings (⚙️ icon in hamburger menu)
   - Enter your new email address
   - Your email is updated while maintaining all your sessions and quiver data

## Technologies Used

- **Backend:**
  - Node.js with ES modules
  - Express 5.1.0
  - express-session (HTTP-only session management)
  - AWS SDK v3 (@aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb)
  - Joi 18.0.1 (comprehensive input validation)
  - bcrypt (password hashing with 10 salt rounds)
  - UUID v4 (unique ID generation)
  - Morgan (HTTP request logging)
  - CORS (with credentials support)
  - dotenv (environment variables)

- **Frontend:**
  - Vanilla JavaScript (ES6+)
  - Modern CSS with custom properties (dark theme)
  - HTML5 date inputs with UK format display
  - Fetch API with credentials
  - Responsive table layout

- **Database:**
  - DynamoDB Local (Docker container)
  - AWS SDK v3.933.0

## License

ISC

## Author

stuskeer
