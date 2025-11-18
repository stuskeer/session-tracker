import express from "express";

const Router = express.Router();

Router.route("/session")
  .get((req, res) => {
    res.send(
      "🤖 Session Route with GET method - this endpoint will get all of the sessions from the database"
    );
  })
  .post((req, res) => {
    res.send(
      "🤖 Session Route with POST method - this endpoint will create a new session in the database"
    );
  });

export default Router;