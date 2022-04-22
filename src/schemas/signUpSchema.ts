import Joi from "joi";

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export default signupSchema;