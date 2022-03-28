import { Router } from "express";
import { postOnFeed, getTimeline, deletePost, putPost } from "../controllers/postsController.js"
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import { newDescriptionSchema, postSchema } from "../schemas/postSchemas.js";

const postRouter = Router();
postRouter.get('/feed', validateTokenMiddleware, getTimeline);
postRouter.post('/feed', validateSchemaMiddleware(postSchema, 422), validateTokenMiddleware, postOnFeed);


postRouter.delete('/feed/:postId', validateTokenMiddleware, deletePost);
postRouter.put('/feed/:postId', validateSchemaMiddleware(newDescriptionSchema, 422), putPost);

export default postRouter;