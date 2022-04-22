import { Router } from "express";
import logoutSchema from "../schemas/logoutSchema.js";
import * as logoutController from "../controllers/logoutController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";

const logoutRouter = Router();

logoutRouter.post('/logout', validateSchemaMiddleware(logoutSchema), logoutController.logout);

export default logoutRouter;
