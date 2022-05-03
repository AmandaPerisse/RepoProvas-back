import { Router } from "express";
import * as homeController from "../controllers/homeController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import setViewsSchema from "../schemas/setViewsSchema.js";
import registerSchema from "../schemas/registerSchema.js";

const homeRouter = Router();

homeRouter.get('/tests-disciplines', homeController.testsDisciplines);
homeRouter.put('/setViews', validateSchemaMiddleware(setViewsSchema), homeController.setViews);
homeRouter.get('/register', homeController.getAllData);
homeRouter.post('/register', validateSchemaMiddleware(registerSchema), homeController.testRegister);

export default homeRouter;
