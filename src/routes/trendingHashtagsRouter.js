import { Router } from "express";
import { getTrendingHashtags, getTrendingHashtagPosts } from "../controllers/trendingHashtagsController.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";

const trendingHashtagsRouter = Router();
trendingHashtagsRouter.get('/hashtag', validateTokenMiddleware, getTrendingHashtags);
trendingHashtagsRouter.get('/hashtags/:hashtag', getTrendingHashtagPosts);
export default trendingHashtagsRouter;