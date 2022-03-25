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
        /* mudar picture url */
        const user = await connection.query(`
            SELECT u.id, u.username, u."pictureUrl" FROM posts p
                JOIN users u ON p."userId"=u.id
                ORDER BY p.id DESC
                LIMIT 20
        `);

        const postInfo = await connection.query(`
            SELECT p.id AS "postId", p.url AS "rawUrl", p.description, p."likesAmount" FROM posts p
                ORDER BY p.id DESC
                LIMIT 20
        `);

        for (let i = 0; i < user.rowCount; i++) {
            await urlMetadata(postInfo.rows[i].rawUrl)
                .then(
                function (metadata) { // success handler
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
                function (error) { // failure handler
                    console.log(error)
                    res.send('url-metadata error').status(503);
                })  
        }

        for (let i = 0; i < user.rowCount; i++) {
            timeline.push(
                {
                    ...postInfo.rows[i],
                    "likedByUser": false,
                    "likedBy": "Em construção",
                    "user": user.rows[i],
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
