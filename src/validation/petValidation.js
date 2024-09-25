const joi = require("joi");

const validateCreateOnePet = joi.object({
  petName: joi
    .string()
    .pattern(/^[a-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": `petName only takes lowercase letters`,
    }),
  gender: joi.string().valid("male", "female").required(),
  ownerId: joi
    .string()
    .pattern(/^[a-z]+$/)
    .messages({ "string.pattern.base": "ownerId only takes string" }),
});

module.exports = {
    validateCreateOnePet,
};
