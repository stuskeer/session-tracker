import joi from "joi";

const sessionSchema = joi.object({
  id: joi.string().required(),
  location: joi.string().required(),
  kite: joi.string().required(),
  max_jump: joi.number().required(),
});

export default sessionSchema;