import { connection } from '../database.js';
import urlMetadata from 'url-metadata';
import { createPost, getUserPosts, createBondPostHashtag,
    getLastPosts, getPost, getPostIdsUserLiked, deleteLikesOnPost, deleteHashtagsPosts,
    deleteSinglePost, createLinkPreview, generateFeedPost,
    insertLike, updateLikesAmount, removeLike, updatePostDescription } from '../repositories/postRepository.js';
import { getLastsHashtags } from '../repositories/hashtagRepository.js';

export async function getTrendingHashtags(req, res) {
    try {
        const trendingHashtags = await getLastsHashtags(10);   
        res.send(trendingHashtags);

    } catch (error) {
        console.error(error);
        res.status(500).send('getTrendingHashtags error');
    }
}

export async function getTrendingHashtagPosts(req, res) {
    const userId = res.locals.user.id;
    const { hashtag } = req.params;

    const timeline = [];
    const urlsDescriptions = [];

    try {
        const rawTimeline = await connection.query(`
            SELECT
                p.id AS "postId",
                p.url AS "rawUrl",
                p.description,
                p."likesAmount",
                u.id as "userId",
                u.name as "userName",
                u."pictureUrl" as "userPictureUrl"
                    FROM posts p
                    JOIN users u ON p."userId"=u.id
                        WHERE p.description
                        LIKE '%#$1 %'
                        ORDER BY p.id DESC
                        LIMIT 20`, [hashtag]);

        console.log(rawTimeline);

        const postIdsUserLiked = await getPostIdsUserLiked(userId);

        for (let i = 0; i < rawTimeline.rowCount; i++) {
            const urlData = await createLinkPreview(rawTimeline.rows[i].rawUrl);
            urlsDescriptions.push(urlData);
        }

        for (let i = 0; i < rawTimeline.rowCount; i++) {
            const post = await generateFeedPost(rawTimeline.rows[i], postIdsUserLiked, urlsDescriptions[i]);
            timeline.push(post);
        }

        res.send(timeline);

    } catch (error) {
        console.error('aqui');
        console.error(error);
        res.status(500).send('getTrendingHashtagPosts error');
    }
}