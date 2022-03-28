import { Router } from "express";
import { postOnFeed, getTimeline, deletePost, likePost, unlikePost } from "../controllers/postsController.js"
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import postSchema from "../schemas/postSchemas.js";

const postRouter = Router();
postRouter.get('/feed', validateTokenMiddleware, getTimeline);
postRouter.post('/feed', validateSchemaMiddleware(postSchema, 422), validateTokenMiddleware, postOnFeed);
postRouter.delete('/feed/:postId', validateTokenMiddleware, deletePost);

postRouter.patch('/like/:postId', validateTokenMiddleware, likePost);
postRouter.patch('/unlike/:postId', validateTokenMiddleware, unlikePost);

export default postRouter;