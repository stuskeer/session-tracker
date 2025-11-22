import database from "../services/database.js";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import sessionSchema, { updateSessionSchema } from "../models/session.js";

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

    const { id, location, kite, duration, max_jump } = value;

    const params = {
      TableName: "Sessions",
      Item: {
        id,
        location,
        kite,
        duration,
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
    const { error, value } = updateSessionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get the session from DynamoDB to verify it exists
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

    // Build dynamic UpdateExpression based on provided fields
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (value.max_jump !== undefined) {
      updateExpressions.push("#max_jump = :max_jump");
      expressionAttributeNames["#max_jump"] = "max_jump";
      expressionAttributeValues[":max_jump"] = value.max_jump;
    }

    if (value.location !== undefined) {
      updateExpressions.push("#location = :location");
      expressionAttributeNames["#location"] = "location";
      expressionAttributeValues[":location"] = value.location;
    }

    if (value.kite !== undefined) {
      updateExpressions.push("#kite = :kite");
      expressionAttributeNames["#kite"] = "kite";
      expressionAttributeValues[":kite"] = value.kite;
    }

    if (value.duration !== undefined) {
      updateExpressions.push("#duration = :duration");
      expressionAttributeNames["#duration"] = "duration";
      expressionAttributeValues[":duration"] = value.duration;
    }

    // Update the session in DynamoDB
    const updateParams = {
      TableName: "Sessions",
      Key: { id: sessionId },
      UpdateExpression: "set " + updateExpressions.join(", "),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
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