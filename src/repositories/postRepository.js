import { connection } from '../database.js';
import urlMetadata from 'url-metadata';

export async function createPost(url, description, creatorId) {
	return await connection.query(`
		INSERT INTO posts (url, description, "userId")
			VALUES ($1, $2, $3)`, [url, description, creatorId]);
}

export async function getUserPosts(userId, limitOfPosts) {
	const userPostsArray = [];
	const userPostsQuery = await connection.query(`
		SELECT * FROM posts
			WHERE "userId" = $1
				ORDER BY id DESC
				LIMIT $2`, [userId, limitOfPosts]);

	for (let i = 0; i < userPostsQuery.rows.length; i++) {
		userPostsArray.push(userPostsQuery.rows[i]);
	}

	return userPostsArray;
}

export async function createBondPostHashtag(postId, hastagId) {
	return await connection.query(`
	INSERT INTO "hashtagsPosts" ("postId", "hashtagId")
		VALUES ($1, $2)`, [postId, hastagId]);
}

export async function getLastPosts(userId, limit) {
	let timelineQuery;
	if (userId) {
		timelineQuery = await connection.query(`
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
						WHERE u.id = $1
						ORDER BY p.id DESC
						LIMIT $2`, [userId, limit]);
	} else {
		timelineQuery = await connection.query(`
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
						LIMIT $1`, [limit]);
	}


	return timelineQuery.rows;
}

export async function getPost(postId, userId) {
	return await connection.query(`
		SELECT * FROM posts
			WHERE id = $1 AND "userId" = $2`, [parseInt(postId), userId]);
}

export async function getPostIdsUserLiked(userId) {
	const userLikesQuery = await connection.query({
		text: `SELECT "postId" FROM likes WHERE "userId" = $1`,
		values: [userId],
		rowMode: 'array'
	});

	return userLikesQuery.rows.flat();
}

export async function createLinkPreview(url) {
	let urlData;
	await urlMetadata(url)
		.then(
			function (metadata) {
				urlData = ({
					"url": {
						"link": metadata.url,
						"title": metadata.title,
						"description": metadata.description,
						"image": metadata.image
					}
				});
			},
			function (error) {
				console.log(`url-metadata error: postId ${rawTimeline.rows[i].postId} has error on url ${error.hostname}`);
				urlData = ({
					"url": {
						"link": url,
						"title": url,
						"description": "BROKEN URL | URL with error or not found",
						"image": "https://i3.wp.com/simpleandseasonal.com/wp-content/uploads/2018/02/Crockpot-Express-E6-Error-Code.png"
					}
			});
		})

		return urlData;
}

export async function generateFeedPost(rawPost, postIdsUserLiked, linkPreview) {
	const isPostLikedByUser = postIdsUserLiked.includes(rawPost.postId);
	const likedBy = await generateLikedBy(rawPost.postId, rawPost.userId, isPostLikedByUser, rawPost.likesAmount);

	const post = {
		id: rawPost.postId,
		rawUrl: rawPost.rawUrl,
		description: rawPost.description,
		likesAmount: rawPost.likesAmount,
		"likedByUser": isPostLikedByUser,
		"likedBy": likedBy,
		"user": {
			id: rawPost.userId,
			name: rawPost.userName,
			pictureUrl: rawPost.userPictureUrl
		},
		...linkPreview
	}

	return post;
}

export async function deleteHashtagsPosts(postId) {
	return await connection.query(`DELETE FROM "hashtagsPosts" WHERE "postId" = $1`, [parseInt(postId)]);
}

export async function deleteSinglePost(postId, userId) {
	return await connection.query(`DELETE FROM posts WHERE id = $1 AND "userId" = $2`, [parseInt(postId), userId]);
}

export async function deleteLikesOnPost(postId) {
	return await connection.query(`DELETE FROM likes WHERE "postId" = $1 `, [parseInt(postId)]);
}

export async function getUsersLikedPost(postId, userId, firstsQty) {
	const arrayUsersLikedPost = await connection.query({
		text: `SELECT u.name FROM likes l
			JOIN users u ON l."userId"=u.id
			WHERE l."postId" = $1 AND u.id != $2
			LIMIT $3`,
		values: [postId, userId, firstsQty],
		rowMode: 'array'
	});
	return arrayUsersLikedPost.rows.flat();
}

export async function generateLikedBy(postId, userId, likedByUser, likesAmount) {
	let likedBy = '';
	if (likesAmount === 0) { return likedBy }
	
	const usersLikedPost = await getUsersLikedPost(postId, userId, 3);
	
	if (likedByUser) {
		if (likesAmount === 1)
			likedBy = 'You';

		if (likesAmount === 2)
			likedBy = `You and ${usersLikedPost[0]}`

		if (likesAmount === 3)
			likedBy = `You, ${usersLikedPost[0]} and ${usersLikedPost[1]}`

		if (likesAmount >= 4)
			likedBy = `You, ${usersLikedPost[0]} and ${likesAmount - 2} others`
	
	} else {
		if (likesAmount === 1)
			likedBy = usersLikedPost[0];

		if (likesAmount === 2)
			likedBy = `${usersLikedPost[0]} and ${usersLikedPost[1]}`

		if (likesAmount === 3)
			likedBy = `${usersLikedPost[0]}, ${usersLikedPost[1]} and ${usersLikedPost[2]}`

		if (likesAmount >= 4)
			likedBy = `${usersLikedPost[0]}, ${usersLikedPost[1]} and ${likesAmount - 2} others`
	}

	return likedBy;
}

export async function insertLike(postId, userId) {
	return await connection.query(`INSERT INTO likes ("postId", "userId")
                VALUES ($1, $2)`, [parseInt(postId), userId]);
}

export async function updateLikesAmount(postId, type) {
	if (type === 'like') {
		return await connection.query(`
            UPDATE posts
                SET "likesAmount" = "likesAmount" + 1
                WHERE id = $1`, [parseInt(postId)]);
	}
	if (type === 'unlike') {
		return await connection.query(`
            UPDATE posts
                SET "likesAmount" = "likesAmount" - 1
                WHERE id = $1`, [parseInt(postId)]);
	}
	return;
}

export async function removeLike(postId, userId) {
	return await connection.query(`DELETE FROM likes
		WHERE "postId" = $1 AND "userId" = $2`, [parseInt(postId), userId]);
}

export async function updatePostDescription(newDescription, postId) {
	return await connection.query(`UPDATE posts
		SET description=$1 WHERE id=$2;`, [newDescription, parseInt(postId)]);
}