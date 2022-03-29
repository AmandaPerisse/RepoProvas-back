import { connection } from '../database.js';
import urlMetadata from 'url-metadata';
import { getPost, getUserLikes, generateLikedBy } from '../repositories/postRepository.js';

export async function getTrendingHashtags(req, res) {

    const hashtags = await connection.query(`
    SELECT * 
    FROM hashtags 
    ORDER BY amount DESC
    LIMIT 10`);
    res.send(hashtags.rows);
}

export async function getTrendingHashtagPosts(req, res) {
    const userId = res.locals.user.id;
    const timeline = [];
    const urlsDescriptions = [];
    const hashtag = req.params.hashtag;
    try {
        const postInfo = await connection.query(`
            select p.id as "postId", p.url as "rawUrl", p.description, p."likesAmount", u.id as "userId", u.name as "userName", u."pictureUrl" as "userPictureUrl"
            from posts p
            join users u on p."userId"=u.id
            where p.description
            like '%#$1 %'
            order by p.id DESC
            limit 20`, [hashtag]);

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
                        console.log(error);
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

