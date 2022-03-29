import { connection } from '../database.js';
import urlMetadata from 'url-metadata';
import { findHashtagsInDescription, getExistingHashtags, addOneInExistingHashtagAmount,
    createNewHashtag, getHashtagData } from '../repositories/hashtagRepository.js';
import { createPost, getUserPosts, createBondPostHashtag, getLastPosts, getPost, getPostIdsUserLiked, createLinkPreview, generateLikedBy } from '../repositories/postRepository.js';

export async function postOnFeed(req, res) {
    const { url, description } = req.body;
    const userId = res.locals.user.id;

    const hashtagsArray = await findHashtagsInDescription(description);
    try {
        const hashtagsIdInPost = [];
        for (let i = 0; i < hashtagsArray.length; i++) {
            const existingHashtag = await getExistingHashtags(hashtagsArray[i]);

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
        const rawTimeline = await getLastPosts(20);
        const postIdsUserLiked = await getPostIdsUserLiked(userId);
        console.log(rawTimeline);

        for (let i = 0; i < rawTimeline.length; i++) {
            await urlMetadata(rawTimeline[i].rawUrl)
                .then(
                    function (metadata) {
                        urlsDescriptions.push({
                            "url":
                            {
                                "link": metadata.url,
                                "title": metadata.title,
                                "description": metadata.description,
                                "image": metadata.image
                            }
                        });
                    },
                    function (error) {
                        console.log('url-metadata error');
                        console.log(`postId ${rawTimeline[i].postId} has error on url ${error.hostname}`);
                        urlsDescriptions.push({
                            "url":
                            {
                                "link": rawTimeline[i].rawUrl,
                                "title": rawTimeline[i].rawUrl,
                                "description": "URL with error or not found",
                                "image": "https://i3.wp.com/simpleandseasonal.com/wp-content/uploads/2018/02/Crockpot-Express-E6-Error-Code.png"
                            }
                    });
                })
        }

        for (let i = 0; i < rawTimeline.length; i++) {
            const likedByUser = postIdsUserLiked.includes(rawTimeline[i].postId) ? true : false;
            const likedBy = await generateLikedBy(rawTimeline[i].postId, userId, likedByUser, rawTimeline[i].likesAmount);

            timeline.push(
                {
                    id: rawTimeline[i].postId,
                    rawUrl: rawTimeline[i].rawUrl,
                    description: rawTimeline[i].description,
                    likesAmount: rawTimeline[i].likesAmount,
                    "likedByUser": likedByUser,
                    "likedBy": likedBy,
                    "user": {
                        id: rawTimeline[i].userId,
                        name: rawTimeline[i].userName,
                        pictureUrl: rawTimeline[i].userPictureUrl
                    },
                    ...urlsDescriptions[i]
                }
            )
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

    try {
        const result = getPost(postId, user.id);
        if (result.rowCount === 0)
            return res.sendStatus(404);
        await connection.query(`DELETE FROM "hashtagsPosts" WHERE "postId" = $1`, [parseInt(postId)]);
        await connection.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [parseInt(postId), user.id]);

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
        const result = getPost(postId, user.id); /* middleware */
        if (result.rowCount === 0)
            return res.sendStatus(404);

        await connection.query(`
            INSERT INTO likes ("postId", "userId")
                VALUES ($1, $2)`, [parseInt(postId), user.id]);

        await connection.query(`
            UPDATE posts
                SET "likesAmount" = "likesAmount" + 1
                WHERE id = $1`, [parseInt(postId)]);

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
        const result = getPost(postId, user.id); /* middleware */
        if (result.rowCount === 0)
            return res.sendStatus(404);

        await connection.query(`
            DELETE FROM likes  WHERE "postId" = $1 AND "userId" = $2`, [parseInt(postId), user.id]);

        await connection.query(`
            UPDATE posts
                SET "likesAmount" = "likesAmount" -1
                WHERE id = $1`, [parseInt(postId)]);

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
        console.log("descrição: ", description)
        console.log("userId: ", userId)
        console.log("postId: ", postId)

        const result = await connection.query(`SELECT * FROM posts WHERE id = $1 AND "userId" = $2`, [parseInt(postId), userId]);
        if (result.rowCount === 0)
            return res.sendStatus(404);
        await connection.query(`UPDATE posts SET description=$1 WHERE id=$2;`, [description, parseInt(postId)]);

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
       const id = req.params.id;

       const rawTimeline = await connection.query(`
       SELECT
           p.id AS "postId",
           p.url AS "rawUrl",
           p.description,
           p."likesAmount",
           u.id AS "userId",
           u.name AS "userName",
           u."pictureUrl" AS "userPictureUrl"
               FROM posts p
               JOIN users u ON p."userId"=u.id
            WHERE p."userId" = $1
   `, [id]);

    for (let i = 0; i < rawTimeline.rowCount; i++) {
        await urlMetadata(rawTimeline[i].rawUrl)
        .then(
            function (metadata) {
                urlsDescriptions.push({
                    "url":
                    {
                        "link": metadata.url,
                        "title": metadata.title,
                        "description": metadata.description,
                        "image": metadata.image
                    }
                });
            },
            function (error) {
                console.log('url-metadata error');
                console.log(`postId ${rawTimeline[i].postId} has error on url ${error.hostname}`);
                urlsDescriptions.push({
                    "url":
                    {
                        "link": rawTimeline[i].rawUrl,
                        "title": rawTimeline[i].rawUrl,
                        "description": "URL with error or not found",
                        "image": "https://i3.wp.com/simpleandseasonal.com/wp-content/uploads/2018/02/Crockpot-Express-E6-Error-Code.png"
                    }
            });
        })
}

   for (let i = 0; i < rawTimeline.rowCount; i++) {
       timeline.push(
           {
               id: rawTimeline[i].postId,
               rawUrl: rawTimeline[i].rawUrl,
               description: rawTimeline[i].description,
               likesAmount: rawTimeline[i].likesAmount,
               "likedByUser": false,
               "likedBy": "Em construção",
               "user": {
                   id: rawTimeline[i].userId,
                   name: rawTimeline[i].userName,
                   pictureUrl: rawTimeline[i].userPictureUrl
               },
               ...urlsDescriptions[i]
           }
       )
   }

   res.send(timeline);

    }
    catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  }