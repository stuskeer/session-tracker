import express from "express";
import sessionController from "../controllers/sessionController.js";
import authController from "../controllers/authController.js";
import requireAuth from "../middleware/auth.js";

const Router = express.Router();

// Authentication routes (public)
Router.post("/auth/login", authController.login);
Router.post("/auth/register", authController.register);
Router.post("/auth/logout", authController.logout);
Router.get("/auth/check", authController.checkAuth);
Router.post("/auth/reset-password/complete", authController.completePasswordReset);

// User settings routes (protected)
Router.get("/auth/quiver", requireAuth, authController.getQuiver);
Router.post("/auth/quiver", requireAuth, authController.addKite);
Router.delete("/auth/quiver", requireAuth, authController.removeKite);
Router.put("/auth/email", requireAuth, authController.updateEmail);
Router.put("/auth/password", requireAuth, authController.updatePassword);

// Admin routes (protected - admin only)
Router.get("/admin/users", requireAuth, authController.getAllUsers);
Router.post("/admin/reset-password", requireAuth, authController.initiatePasswordReset);
Router.get("/admin/users/:userId/sessions", requireAuth, sessionController.getUserSessions);
Router.put("/admin/sessions/:id", requireAuth, sessionController.adminUpdateSession);
Router.delete("/admin/sessions/:id", requireAuth, sessionController.adminDeleteSession);

// Session routes (protected - require authentication)
Router.route("/sessions")
  .get(requireAuth, sessionController.getAllSessions)
  .post(requireAuth, sessionController.createSession);

Router.route("/sessions/:id") // <-- this defines an endpoint with a "placeholder" for the id
  .get(requireAuth, sessionController.getSessionById)
  .put(requireAuth, sessionController.updateSessionById)
  .delete(requireAuth, sessionController.deleteSessionById);

export default Router;