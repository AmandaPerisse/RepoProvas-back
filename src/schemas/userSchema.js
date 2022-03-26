import joi from 'joi';

const userSchema = joi.object({
  userName: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  pictureUrl: joi.string().uri().required()
});

export default userSchema;
