import { connection } from '../database.js';
import urlMetadata from 'url-metadata';

export async function postOnFeed(req, res) {
    const { url, description } = req.body;
    const userId = res.locals.user.id;

    function findHashtags(description) {
        const descriptionArray = description.split(' ');
        const hashtagsArray = [];

        for (let i = 0; i < descriptionArray.length; i++) {
            if (descriptionArray[i][0] === "#") {
                if (hashtagsArray.includes(descriptionArray[i].replace('#', ''))) { continue };
                hashtagsArray.push(descriptionArray[i].replace('#', ''));
                continue;
            }
        }
        return hashtagsArray;
    }

    const hashtagsArray = findHashtags(description);

    try {
        const hashtagsIdInPost = [];

        for (let i = 0; i < hashtagsArray.length; i++) {
            const existingHashtag = await connection.query(`
                SELECT * FROM hashtags
                    WHERE name=$1`, [hashtagsArray[i]]);

            if (existingHashtag.rows[0]) {
                hashtagsIdInPost.push(existingHashtag.rows[0].id)
                await connection.query(`
                    UPDATE hashtags
                        SET amount = amount + 1
                        WHERE id = $1`, [existingHashtag.rows[0].id]);
                continue;

            } else {
                await connection.query(`
                    INSERT INTO hashtags (name, "userId")
                        VALUES ($1, $2)`, [hashtagsArray[i], userId]);

                const hashtagJustCreated = await connection.query(`
                    SELECT * FROM hashtags
                        WHERE "userId" = $1
                            ORDER BY id DESC
                            LIMIT 1`, [userId]);

                hashtagsIdInPost.push(hashtagJustCreated.rows[0].id)
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
                        console.log(error)
                        res.send('url-metadata error').status(503);
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

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export async function deletePost(req, res) {
    const { postId } = req.params;
    const { user } = res.locals;

    try {
        const result = await connection.query(`SELECT * FROM posts WHERE id = $1 AND "userId" = $2`, [parseInt(postId), user.id]);
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