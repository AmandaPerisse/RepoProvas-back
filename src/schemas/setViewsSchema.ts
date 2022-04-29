import Joi from "joi";

const setViewsSchema = Joi.object({
    url: Joi.string().required(),
});

export default setViewsSchema;