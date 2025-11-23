import database from "../services/database.js";
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { loginSchema, registerSchema, updateEmailSchema, kiteSchema } from "../models/user.js";

const SALT_ROUNDS = 10;

async function login(req, res, next) {
  try {
    // Validate and sanitize input
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { email, password } = value;

    // Find user by email using ScanCommand
    const scanParams = {
      TableName: "users",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const scanResult = await database.send(new ScanCommand(scanParams));

    // Check if user exists
    if (!scanResult.Items || scanResult.Items.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = scanResult.Items[0];

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
      Key: { user_id: user.user_id },
      UpdateExpression: "set last_logon = :logon",
      ExpressionAttributeValues: {
        ":logon": ukDateTime,
      },
    };

    await database.send(new UpdateCommand(updateParams));

    // Store user UUID in session
    req.session.userId = user.user_id;
    req.session.userEmail = user.email;
    req.session.isAuthenticated = true;

    res.status(200).json({ 
      message: "Login successful",
      user: { email: user.email }
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    // Validate and sanitize input
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { email, password } = value;

    // Check if email already exists using ScanCommand
    const scanParams = {
      TableName: "users",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const scanResult = await database.send(new ScanCommand(scanParams));

    if (scanResult.Items && scanResult.Items.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Generate UUID for user_id
    const userId = uuidv4();

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

    // Create new user with UUID as primary key
    const params = {
      TableName: "users",
      Item: {
        user_id: userId,
        email: email,
        password: hashedPassword,
        account_created: ukDateTime,
        last_logon: null,
        quiver: [], // Initialize empty quiver
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
    return res.status(200).json({ authenticated: true, user: { email: req.session.userEmail } });
  }
  res.status(200).json({ authenticated: false });
}

async function getQuiver(req, res, next) {
  try {
    const userId = req.session.userId;
    
    const params = {
      TableName: "users",
      Key: { user_id: userId },
    };
    
    const result = await database.send(new GetCommand(params));
    
    if (!result.Item) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ quiver: result.Item.quiver || [] });
  } catch (error) {
    next(error);
  }
}

async function addKite(req, res, next) {
  try {
    // Validate and sanitize input
    const { error, value } = kiteSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.session.userId;
    const { kite } = value;
    
    // Get current quiver
    const getParams = {
      TableName: "users",
      Key: { user_id: userId },
    };
    
    const result = await database.send(new GetCommand(getParams));
    
    if (!result.Item) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const currentQuiver = result.Item.quiver || [];
    
    // Check if kite already exists
    if (currentQuiver.includes(kite.trim())) {
      return res.status(400).json({ error: "Kite already exists in quiver" });
    }
    
    // Add kite to quiver
    const updatedQuiver = [...currentQuiver, kite.trim()];
    
    const updateParams = {
      TableName: "users",
      Key: { user_id: userId },
      UpdateExpression: "set quiver = :quiver",
      ExpressionAttributeValues: {
        ":quiver": updatedQuiver,
      },
    };
    
    await database.send(new UpdateCommand(updateParams));
    
    res.status(200).json({ 
      message: "Kite added successfully",
      quiver: updatedQuiver
    });
  } catch (error) {
    next(error);
  }
}

async function removeKite(req, res, next) {
  try {
    // Validate and sanitize input
    const { error, value } = kiteSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.session.userId;
    const { kite } = value;
    
    // Get current quiver
    const getParams = {
      TableName: "users",
      Key: { user_id: userId },
    };
    
    const result = await database.send(new GetCommand(getParams));
    
    if (!result.Item) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const currentQuiver = result.Item.quiver || [];
    
    // Remove kite from quiver
    const updatedQuiver = currentQuiver.filter(k => k !== kite);
    
    const updateParams = {
      TableName: "users",
      Key: { user_id: userId },
      UpdateExpression: "set quiver = :quiver",
      ExpressionAttributeValues: {
        ":quiver": updatedQuiver,
      },
    };
    
    await database.send(new UpdateCommand(updateParams));
    
    res.status(200).json({ 
      message: "Kite removed successfully",
      quiver: updatedQuiver
    });
  } catch (error) {
    next(error);
  }
}

async function updateEmail(req, res, next) {
  try {
    // Validate and sanitize input
    const { error, value } = updateEmailSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.session.userId;
    const { email: newEmail } = value;
    
    // Check if new email is different from current
    if (newEmail === req.session.userEmail) {
      return res.status(400).json({ error: "New email is the same as current email" });
    }
    
    // Check if new email already exists using ScanCommand
    const scanParams = {
      TableName: "users",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": newEmail,
      },
    };
    
    const scanResult = await database.send(new ScanCommand(scanParams));
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }
    
    // Update email field only (user_id remains the same)
    const updateParams = {
      TableName: "users",
      Key: { user_id: userId },
      UpdateExpression: "set email = :email",
      ExpressionAttributeValues: {
        ":email": newEmail,
      },
    };
    
    await database.send(new UpdateCommand(updateParams));
    
    // Update session with new email
    req.session.userEmail = newEmail;
    
    res.status(200).json({ 
      message: "Email updated successfully",
      user: { email: newEmail }
    });
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }
    
    // Get user from database
    const getParams = {
      TableName: "users",
      Key: { user_id: userId },
    };
    
    const result = await database.send(new GetCommand(getParams));
    
    if (!result.Item) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const user = result.Item;
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    const updateParams = {
      TableName: "users",
      Key: { user_id: userId },
      UpdateExpression: "set password = :password",
      ExpressionAttributeValues: {
        ":password": hashedNewPassword,
      },
    };
    
    await database.send(new UpdateCommand(updateParams));
    
    res.status(200).json({ 
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
}

export default {
  login,
  register,
  logout,
  checkAuth,
  getQuiver,
  addKite,
  removeKite,
  updateEmail,
  updatePassword,
};
