import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(8).required(),
});

export const videoPutSchema = Joi.object({
  body: Joi.object({ 
    title: Joi.string().max(30)
  }),
  params: Joi.object({
    videoId: Joi.number().required()
  })
});
