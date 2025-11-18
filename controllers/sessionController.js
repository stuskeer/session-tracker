import database from "../services/database.js";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import sessionSchema from "../models/session.js";

async function getAllSessions(req, res, next) {
  try {
    const params = {
      TableName: "Sessions",
    };
    const command = new ScanCommand(params);
    const result = await database.send(command);
    res.status(200).json(result.Items);
  } catch (err) {
    next(err);
  }
}

async function createSession(req, res, next) {
  try {
    const uuid = uuidv4();
    req.body.id = uuid;
    const { error, value } = sessionSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { id, location, kite, max_jump } = value;

    const params = {
      TableName: "Sessions",
      Item: {
        id,
        location,
        kite,
        max_jump,
      },
    };

    const command = new PutCommand(params);

    await database.send(command);

    res
      .status(201)
      .json({ message: "Successfully created session", data: params.Item });
  } catch (error) {
    next(error);
  }
}

async function getSessionById(req, res, next) {
  const sessionId = req.params.id;
  try {
    const params = {
      TableName: "Sessions",
      Key: { id: sessionId },
    };
    const command = new GetCommand(params);
    const result = await database.send(command);
    if (!result.Item) {
      return res.status(404).json({ message: "No session found" });
    }
    res.status(200).json(result.Item);
  } catch (err) {
    next(err);
  }
}

async function updateSessionById(req, res, next) {
  try {
    const sessionId = req.params.id;
    req.body.id = sessionId;
    const { error, value } = sessionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { max_jump, location, kite } = value;

    // Get the movie from DynamoDB
    const getParams = {
      TableName: "Sessions",
      Key: { id: sessionId },
    };

    const getCommand = new GetCommand(getParams);

    const result = await database.send(getCommand);

    const session = result.Item;

    if (!session) {
      return res.status(404).json({ message: "No session found" });
    }

    // Update the session in DynamoDB
    const updateParams = {
      TableName: "Sessions",
      Key: { id: sessionId },
      UpdateExpression:
        "set #max_jump = :max_jump, #location = :location, #kite = :kite",
      ExpressionAttributeNames: {
        "#max_jump": "max_jump",
        "#location": "location",
        "#kite": "kite",
      },
      ExpressionAttributeValues: {
        ":max_jump": max_jump,
        ":location": location,
        ":kite": kite,
      },
      ReturnValues: "ALL_NEW",
    };
    const updateCommand = new UpdateCommand(updateParams);
    const updatedSession = await database.send(updateCommand);

    res.status(200).json(updatedSession.Attributes);
  } catch (err) {
    next(err);
  }
}

async function deleteSessionById(req, res, next) {
  const sessionId = req.params.id;
  try {
    const params = {
      TableName: "Sessions",
      Key: { id: sessionId },
    };
    const command = new DeleteCommand(params);
    await database.send(command);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export default {
  getAllSessions,
  createSession,
  getSessionById,
  updateSessionById,
  deleteSessionById,
};