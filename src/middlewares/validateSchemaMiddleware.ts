import { Request, Response, NextFunction } from "express";
import { ObjectSchema, Schema } from "joi";

export function validateSchemaMiddleware(schema: ObjectSchema) {
  
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.validate(req.body);
    if (validation.error) {
      return res.status(422).send(validation.error);
    }
    next();
  }
}