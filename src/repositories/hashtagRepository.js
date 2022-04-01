import { connection } from '../database.js';

export async function findHashtagsInDescription(description) {
	const descriptionArray = description.split(' ');
	const hashtagsArray = [];

    function isHashtagRepeated(hashtagName) {
        return hashtagsArray.includes(hashtagName.replace('#', ''));
    }

	for (let i = 0; i < descriptionArray.length; i++) {
		if (descriptionArray[i][0] === "#") {
			if (isHashtagRepeated(descriptionArray[i])) { continue };

            const hashtagName = descriptionArray[i].replace('#', '');
			if (hashtagName.length === 0 || hashtagName.includes('#')) { continue };

			hashtagsArray.push(hashtagName);
			continue;
		}
	}
	return hashtagsArray;
}

export async function addOneInExistingHashtagAmount(hashtagId) {
	return await connection.query(`
		UPDATE hashtags
			SET amount = amount + 1
			WHERE id = $1`, [hashtagId]);
}

export async function createNewHashtag(hashtagName, creatorId) {
	return await connection.query(`
		INSERT INTO hashtags (name, "userId")
			VALUES ($1, $2)`, [hashtagName, creatorId]);
}

export async function getHashtagDataByParameter(columnName, parameter) {
	const sqlInjection = /\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b/;
	
	const columnNameArray = columnName.split(' ');

	if (columnNameArray.length > 1) 
		return console.error('column name must be a single word');
		
	if(sqlInjection.test(columnName.toUpperCase())) 
		return console.error('blocked sql injection try');
	
	const hashtagQuery = await connection.query(`
		SELECT * FROM hashtags
			WHERE ${columnName} = $1`, [parameter]);
	console
	return hashtagQuery.rows[0];
}

export async function getLastsHashtags(limit) {
	const lastHashtagsQuery = await connection.query(`
    	SELECT * 
    		FROM hashtags 
    		ORDER BY amount DESC
    		LIMIT $1`, [limit]);

    return lastHashtagsQuery.rows;
}

export async function getLastPostsWithHashtag(userId, hashtagName, limit) {
	let timelineQuery;
	if (userId) {
		timelineQuery = await connection.query(`
		SELECT
			p.id AS "postId",
			p.url AS "rawUrl",
			p.description,
			p."likesAmount",
			u.id as "userId",
			u.name as "userName",
			u."pictureUrl" as "userPictureUrl"
				FROM posts p
				JOIN users u ON p."userId"=u.id
					WHERE u.id = $1
					AND p.description
					LIKE $2
					ORDER BY p.id DESC
					LIMIT $3`, [userId, '%#' + hashtagName + ' %', limit]);
	} else {
		timelineQuery = await connection.query(`
			SELECT
				p.id AS "postId",
				p.url AS "rawUrl",
				p.description,
				p."likesAmount",
				u.id as "userId",
				u.name as "userName",
				u."pictureUrl" as "userPictureUrl"
					FROM posts p
					JOIN users u ON p."userId"=u.id
						WHERE p.description
						LIKE $1
						ORDER BY p.id DESC
						LIMIT $2`, ['%#' + hashtagName + ' %', limit]);
	}


	return timelineQuery.rows;
}