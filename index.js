import 'dotenv/config';
import express from "express";
import session from "express-session";
import Router from "./views/router.js";
import cors from "cors";

const port = 3000;
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(express.static('frontend')); // Add this line to serve static files

// Redirect root to appropriate page based on role
app.get('/', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    if (req.session.userRole === 'admin') {
      res.redirect('/admin.html');
    } else {
      res.redirect('/index.html');
    }
  } else {
    res.redirect('/login.html');
  }
});

app.use(Router);

async function startServer() {
  try {
    app.listen(port, () => console.log(`🤖 Listening on Port: ${port}`));
  } catch (err) {
    console.log("🤖 Oh no something went wrong", err);
  }
}

startServer();