import { connection } from '../database.js';
import urlMetadata from 'url-metadata';

export async function getTrendingHashtags(req, res) {

  const hashtags = await connection.query(`
    SELECT * 
    FROM hashtags 
    ORDER BY amount DESC
    LIMIT 10`);
  res.send(hashtags.rows);
}

export async function getTrendingHashtagPosts(req, res) {

    let timeline = [];

  const hashtag = req.params.hashtag;
  try{
    const postInfo = await connection.query(`
    select p.id as "postId", p.url as "rawUrl", p.description, p."likesAmount", u.id as "userId", u."userName", u."pictureUrl" as "userPictureUrl"
    from posts p
    join users u on p."userId"=u.id
    where p.description
    like '%#${hashtag} %'
    order by p.id DESC
    limit 20`);
    
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

