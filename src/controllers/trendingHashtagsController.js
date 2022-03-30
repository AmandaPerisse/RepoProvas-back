import { connection } from '../database.js';
import urlMetadata from 'url-metadata';
import { createPost, getUserPosts, createBondPostHashtag,
    getLastPosts, getPost, getPostIdsUserLiked, deleteLikesOnPost, deleteHashtagsPosts,
    deleteSinglePost, createLinkPreview, generateFeedPost,
    insertLike, updateLikesAmount, removeLike, updatePostDescription } from '../repositories/postRepository.js';
import { getLastsHashtags, getLastPostsWithHashtag } from '../repositories/hashtagRepository.js';

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
        const rawTimeline = await getLastPostsWithHashtag(null, hashtag, 20);
        const postIdsUserLiked = await getPostIdsUserLiked(userId);
        
        for (let i = 0; i < rawTimeline.length; i++) {
            const urlData = await createLinkPreview(rawTimeline[i].rawUrl);
            urlsDescriptions.push(urlData);
        }

        for (let i = 0; i < rawTimeline.length; i++) {
            const post = await generateFeedPost(rawTimeline[i], postIdsUserLiked, urlsDescriptions[i]);
            timeline.push(post);
        }

        res.send(timeline);

    } catch (error) {
        console.error(error);
        res.status(500).send('getTrendingHashtagPosts error');
    }
}