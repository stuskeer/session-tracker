import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Router from "./views/router.js";
import cors from "cors";

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(Router);

async function startServer() {
  try {
    app.listen(port, () => console.log(`🤖 Listening on Port: ${port}`));
  } catch (err) {
    console.log("🤖 Oh no something went wrong", err);
  }
}

startServer();