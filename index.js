import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

const port = process.env.PORT;
const app = express();

app.use(cors()); 
app.use(express.json());

async function startServer() {
  try {
    app.listen(port, () => console.log(`🤖 Listening on Port: ${port}`));
  } catch (err) {
    console.log("🤖 Oh no something went wrong", err);
  }
}

startServer();