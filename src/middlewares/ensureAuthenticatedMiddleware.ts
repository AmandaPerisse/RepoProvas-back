import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../database.js";
dotenv.config();

export async function ensureAuthenticatedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    res.send("Missing authorization header");
  };

  const token = authorization.replace("Bearer ", "");
  if (!token){
    res.send("Missing token");
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: number;
    };
    const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    });
    if (!user){
      res.send("User not found");
    }

    res.locals.user = user;

    next();
  } catch {
    res.send("Invalid token");
  }
}
