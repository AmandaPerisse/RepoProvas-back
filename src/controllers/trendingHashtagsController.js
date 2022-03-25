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

  const hashtag = req.params.hashtag;
  const posts = await connection.query(`
  select p.id as "postId", p.url as "rawUrl", p.description, p."likesAmount", u.id as "userId", u."userName", u."pictureUrl" as "userPictureUrl"
  from posts p
  join users u on p."userId"=u.id
  where p.description
  like '%#${hashtag} %'
  order by p.id DESC
  limit 20`);
  res.send(posts.rows);
  
}

