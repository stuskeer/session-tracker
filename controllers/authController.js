import database from "../services/database.js";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

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

    // Check if password matches
    // Note: In production, you should use bcrypt to hash passwords
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

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
  logout,
  checkAuth,
};
