import { findHashtagsInDescription, addOneInExistingHashtagAmount,
    createNewHashtag, getHashtagData } from '../repositories/hashtagRepository.js';
import { createPost, getUserPosts, createBondPostHashtag,
    getLastPosts, getPost, getPostIdsUserLiked, deleteLikesOnPost, deleteHashtagsPosts,
    deleteSinglePost, createLinkPreview, generateFeedPost,
    insertLike, updateLikesAmount, removeLike, updatePostDescription } from '../repositories/postRepository.js';

export async function postOnFeed(req, res) {
    const { url, description } = req.body;
    const userId = res.locals.user.id;

    const hashtagsArray = await findHashtagsInDescription(description);
    try {
        const hashtagsIdInPost = [];
        for (let i = 0; i < hashtagsArray.length; i++) {
            const existingHashtag = await getHashtagData(hashtagsArray[i]);

            if (existingHashtag) {
                hashtagsIdInPost.push(existingHashtag.id)
                await addOneInExistingHashtagAmount(existingHashtag.id);
                continue;

            } else {
                await createNewHashtag(hashtagsArray[i], userId);
                const hashtagJustCreated = await getHashtagData(hashtagsArray[i])
                hashtagsIdInPost.push(hashtagJustCreated.id)
            }
        }

        await createPost(url, description, userId);

        const [ justPostedPost ] = await getUserPosts(userId, 1);

        for (let i = 0; i < hashtagsIdInPost.length; i++) {
            await createBondPostHashtag(justPostedPost.id, hashtagsIdInPost[i])
        }

        res.sendStatus(201);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export async function getTimeline(req, res) {
    const userId = res.locals.user.id;

    const timeline = [];
    const urlsDescriptions = [];

    try {
        const rawTimeline = await getLastPosts(null, 20);
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
        res.sendStatus(500);
    }
}

export async function deletePost(req, res) {
    const { postId } = req.params;
    const { user } = res.locals;

    console.log(user.id);

    try {
        const result = getPost(postId, user.id);
        if (result.rowCount === 0)
            return res.sendStatus(404);

        await deleteLikesOnPost(postId);
        await deleteHashtagsPosts(postId);
        await deleteSinglePost(postId, user.id);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function likePost(req, res) {
    const { postId } = req.params;
    const { user } = res.locals;

    try {
        const result = getPost(postId, user.id);
        if (result.rowCount === 0)
            return res.sendStatus(404);

        await insertLike(postId, user.id);
        await updateLikesAmount(postId, 'like');

        res.sendStatus(200);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function unlikePost(req, res) {
    const { postId } = req.params;
    const { user } = res.locals;

    try {
        const result = getPost(postId, user.id);
        if (result.rowCount === 0)
            return res.sendStatus(404);

        await removeLike(postId, user.id);
        await updateLikesAmount(postId, 'unlike');


        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function putPost(req, res) {
    const { postId } = req.params;
    const { description, userId } = req.body;

    try {
        const result = await getPost(postId, userId)
        if (result.rowCount === 0)
            return res.sendStatus(404);

        await updatePostDescription(description, postId);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function userPosts(req, res) {
    const timeline = [];
    const urlsDescriptions = [];
    
    try {
       const userId = req.params.id;
       const rawTimeline = await getLastPosts(userId, 20);

        for (let i = 0; i < rawTimeline.length; i++) {
            const urlData = await createLinkPreview(rawTimeline[i].rawUrl);
            urlsDescriptions.push(urlData);
        }

        for (let i = 0; i < rawTimeline.length; i++) {
            const post = await generateFeedPost(rawTimeline[i], postIdsUserLiked, urlsDescriptions[i]);
            timeline.push(post);
        }

        res.send(timeline);
    }
    catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  }