import { Router } from "express";
import * as homeController from "../controllers/homeController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import setViewsSchema from "../schemas/setViewsSchema.js";

const homeRouter = Router();

homeRouter.get('/tests-disciplines', homeController.testsDisciplines);
homeRouter.put('/setViews', validateSchemaMiddleware(setViewsSchema), homeController.setViews);

export default homeRouter;
