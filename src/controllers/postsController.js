import { connection } from '../database.js';
import urlMetadata from 'url-metadata';
import { findHashtagsInDescription, getExistingHashtags, addOneInExistingHashtagAmount,
    createNewHashtag, getHashtagData } from '../repositories/hashtagRepository.js';
import { getPost, getUserLikes, generateLikedBy } from '../repositories/postRepository.js';

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

        await connection.query(`
            INSERT INTO posts (url, description, "userId")
                VALUES ($1, $2, $3)`, [url, description, userId]);

        const justPostedPost = await connection.query(`
            SELECT * FROM posts
                WHERE "userId" = $1
                    ORDER BY id DESC
                    LIMIT 1`, [userId]);

        const justPostedPostId = justPostedPost.rows[0].id;

        for (let i = 0; i < hashtagsIdInPost.length; i++) {
            await connection.query(`
                INSERT INTO "hashtagsPosts" ("postId", "hashtagId")
                    VALUES ($1, $2)`, [justPostedPostId, hashtagsIdInPost[i]]);
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
        /* FALTA QUERY PARA likedByUser e likedBy */
        const postInfo = await connection.query(`
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
                        ORDER BY p.id DESC
                        LIMIT 20
        `);

        const userLikes = await getUserLikes(userId);
        const postIdsUserLiked = [].concat.apply([], userLikes.rows);

        for (let i = 0; i < postInfo.rowCount; i++) {
            await urlMetadata(postInfo.rows[i].rawUrl)
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
                        console.log(`postId ${postInfo.rows[i].postId} has error on url ${error.hostname}`);
                        urlsDescriptions.push({
                            "url":
                            {
                                "link": postInfo.rows[i].rawUrl,
                                "title": postInfo.rows[i].rawUrl,
                                "description": "URL with error or not found",
                                "image": "https://i3.wp.com/simpleandseasonal.com/wp-content/uploads/2018/02/Crockpot-Express-E6-Error-Code.png"
                            }
                    });
                })
        }

        for (let i = 0; i < postInfo.rowCount; i++) {
            const likedByUser = postIdsUserLiked.includes(postInfo.rows[i].postId) ? true : false;
            const likedBy = await generateLikedBy(postInfo.rows[i].postId, userId, likedByUser, postInfo.rows[i].likesAmount);

            timeline.push(
                {
                    id: postInfo.rows[i].postId,
                    rawUrl: postInfo.rows[i].rawUrl,
                    description: postInfo.rows[i].description,
                    likesAmount: postInfo.rows[i].likesAmount,
                    "likedByUser": likedByUser,
                    "likedBy": likedBy,
                    "user": {
                        id: postInfo.rows[i].userId,
                        name: postInfo.rows[i].userName,
                        pictureUrl: postInfo.rows[i].userPictureUrl
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

       const postInfo = await connection.query(`
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

    for (let i = 0; i < postInfo.rowCount; i++) {
        await urlMetadata(postInfo.rows[i].rawUrl)
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
                console.log(`postId ${postInfo.rows[i].postId} has error on url ${error.hostname}`);
                urlsDescriptions.push({
                    "url":
                    {
                        "link": postInfo.rows[i].rawUrl,
                        "title": postInfo.rows[i].rawUrl,
                        "description": "URL with error or not found",
                        "image": "https://i3.wp.com/simpleandseasonal.com/wp-content/uploads/2018/02/Crockpot-Express-E6-Error-Code.png"
                    }
            });
        })
}

   for (let i = 0; i < postInfo.rowCount; i++) {
       timeline.push(
           {
               id: postInfo.rows[i].postId,
               rawUrl: postInfo.rows[i].rawUrl,
               description: postInfo.rows[i].description,
               likesAmount: postInfo.rows[i].likesAmount,
               "likedByUser": false,
               "likedBy": "Em construção",
               "user": {
                   id: postInfo.rows[i].userId,
                   name: postInfo.rows[i].userName,
                   pictureUrl: postInfo.rows[i].userPictureUrl
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