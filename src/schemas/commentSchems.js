import joi from 'joi';

export const commentSchema = joi.object({
    postId: joi.number().min(1).required(),
    comment: joi.string().required()
});