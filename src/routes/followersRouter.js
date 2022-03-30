import { Router } from "express";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import { newDescriptionSchema, postSchema } from "../schemas/postSchemas.js";

const followerRouter = Router();

export default followerRouter;