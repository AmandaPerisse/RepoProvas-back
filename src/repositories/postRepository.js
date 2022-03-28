import { connection } from '../database.js';

export async function getPost(postId, userId) {
	return await connection.query(`
		SELECT * FROM posts
			WHERE id = $1 AND "userId" = $2`, [parseInt(postId), userId]);
}

export async function getUserLikes(userId) {
	return await connection.query({
		text: `SELECT "postId" FROM likes WHERE "userId" = $1`,
		values: [userId],
		rowMode: 'array'
	});
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

	return [].concat.apply([], arrayUsersLikedPost.rows);
}

export async function generateLikedBy(postId, userId, likedByUser, likesAmount) {
	let likedBy = '';
	if (likesAmount === 0) { return likedBy }
	if (likesAmount === 1 && likedByUser) { return likedBy = 'Você' }
	
	const usersLikedPost = await getUsersLikedPost(postId, userId, 2);
	
	if (likesAmount === 1 && !likedByUser) { return likedBy = usersLikedPost[0]}

	if (likesAmount === 2) {
		likedBy = likedByUser ? `Você e ${usersLikedPost[0]}` : `${usersLikedPost[0]} e ${usersLikedPost[1]}`
		return likedBy;
	}
	
	if (likesAmount > 2) {
		likedBy = likedByUser ?
			`Você, ${usersLikedPost[0]} e ${likesAmount - 2 === 1 ? usersLikedPost[2] : `outras ${likesAmount - 2} pessoas`}` :
			`${usersLikedPost[0]}, ${usersLikedPost[1]} e ${likesAmount - 2 === 1 ? usersLikedPost[2] : `outras ${likesAmount - 2} pessoas`}`
		return likedBy;
	}

	return likedBy;
}