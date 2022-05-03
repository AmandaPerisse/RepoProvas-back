import Joi from "joi";

const registerSchema = Joi.object({
    name: Joi.string().required(),
    pdf: Joi.string().required(),
    category: Joi.string().required(),
    discipline: Joi.string().required(),
    teacher: Joi.string().required(),
    term: Joi.string().required()
});

export default registerSchema;