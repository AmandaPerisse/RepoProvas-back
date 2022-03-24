import { Router } from "express";
import { postOnFeed } from "../controllers/postsController.js"
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import postSchema from "../schemas/postSchemas.js";

const postRouter = Router();
postRouter.post('/feed', validateSchemaMiddleware(postSchema, 422), validateTokenMiddleware, postOnFeed);

export default postRouter;