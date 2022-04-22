import { Router } from "express";
import loginSchema from "../schemas/loginSchema.js";
import * as loginController from "../controllers/loginController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";

const loginRouter = Router();

loginRouter.post('/login', validateSchemaMiddleware(loginSchema), loginController.login);

export default loginRouter;
