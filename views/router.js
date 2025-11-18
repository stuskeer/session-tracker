import express from "express";
import sessionController from "../controllers/sessionController.js";

const Router = express.Router();

Router.route("/sessions")
  .get(sessionController.getAllSessions)
  .post(sessionController.createSession);

  Router.route("/sessions/:id") // <-- this defines an endpoint with a "placeholder" for the id
  .get(sessionController.getSessionById)
  .put(sessionController.updateSessionById)
  .delete(sessionController.deleteSessionById);

export default Router;