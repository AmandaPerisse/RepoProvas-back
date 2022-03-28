import joi from 'joi';

export const postSchema = joi.object({
    url: joi.string().uri().required(),
    description: joi.string().allow(null, '')
});

export const newDescriptionSchema = joi.object({
    description: joi.string().allow(null, ''),
    userId: joi.number().min(1).required(),
});