import { Router } from "express";
import signupSchema from "../schemas/signupSchema.js";
import * as signupController from "../controllers/signupController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";

const signupRouter = Router();

signupRouter.post('/sign-up', validateSchemaMiddleware(signupSchema), signupController.create);

export default signupRouter;