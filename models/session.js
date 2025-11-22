import joi from "joi";

const sessionSchema = joi.object({
  id: joi.string().required(),
  user_id: joi.string().required(),
  location: joi.string().required(),
  kite: joi.string().required(),
  duration: joi.string().optional(),
  max_jump: joi.number().required(),
});

const updateSessionSchema = joi.object({
  id: joi.string().required(),
  user_id: joi.string().optional(),
  location: joi.string().optional(),
  kite: joi.string().optional(),
  duration: joi.string().optional(),
  max_jump: joi.number().optional(),
}).min(2); // At least id + one other field

export default sessionSchema;
export { updateSessionSchema };