import { Router } from "express";
import * as homeController from "../controllers/homeController.js";

const homeRouter = Router();

homeRouter.get('/tests-disciplines', homeController.testsDisciplines);

export default homeRouter;
