import database from "../services/database.js";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Query the users table to find the user by email (user_id)
    const params = {
      TableName: "users",
      Key: { user_id: email },
    };

    const command = new GetCommand(params);
    const result = await database.send(command);

    // Check if user exists
    if (!result.Item) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.Item;

    // Check if password matches (with bcrypt)
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last_logon with current UK date/time
    const ukDateTime = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const updateParams = {
      TableName: "users",
      Key: { user_id: email },
      UpdateExpression: "set last_logon = :logon",
      ExpressionAttributeValues: {
        ":logon": ukDateTime,
      },
    };

    await database.send(new UpdateCommand(updateParams));

    // Store user info in session
    req.session.userId = user.user_id;
    req.session.isAuthenticated = true;

    res.status(200).json({ 
      message: "Login successful",
      user: { email: user.user_id }
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const checkParams = {
      TableName: "users",
      Key: { user_id: email },
    };

    const checkResult = await database.send(new GetCommand(checkParams));

    if (checkResult.Item) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Get current UK date/time
    const ukDateTime = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Create new user
    const params = {
      TableName: "users",
      Item: {
        user_id: email,
        password: hashedPassword,
        account_created: ukDateTime,
        last_logon: null,
      },
    };

    await database.send(new PutCommand(params));

    res.status(201).json({ 
      message: "User registered successfully",
      user: { email }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    next(error);
  }
}

async function checkAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return res.status(200).json({ authenticated: true, user: { email: req.session.userId } });
  }
  res.status(200).json({ authenticated: false });
}

export default {
  login,
  register,
  logout,
  checkAuth,
};
