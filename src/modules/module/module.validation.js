import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};


export const createModuleSchema = Joi.object({
  name: Joi.string().min(3).max(40).required(),
  description: Joi.string().min(5).max(255).optional(),

  teachers: Joi.array()
    .items(Joi.string().custom(objectId))
    .min(1)
    .required(),

  students: Joi.array()
    .items(Joi.string().custom(objectId))
    .optional(),

  coverImage: Joi.string().uri().optional(),
});

export const updateModuleSchema = Joi.object({
  name: Joi.string().min(3).max(40),
  description: Joi.string().min(5).max(255),

  teachers: Joi.array().items(Joi.string().custom(objectId)),
  students: Joi.array().items(Joi.string().custom(objectId)),

  coverImage: Joi.string().uri(),

  isArchived: Joi.boolean(),
}).min(1);
