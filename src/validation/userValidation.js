const joi = require("joi");

const validateSignUp = joi.object({
  fullName: joi
    .string()
    .pattern(/^[a-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": `fullName only takes lowercase letters`,
    }),
  email: joi
    .string()
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
    .email()
    .required()
    .messages({
      "string.pattern.base":
        "Email takes only lowercase letters, numbers, and common special characters.",
      "string.email": "Invalid email address.",
      "any.required": "Email is required.",
    }),
  emailotp: joi.number().required(),
  phoneNumber: joi
    .string()
    .length(10)
    .pattern(/[0-9]{9}/)
    .required(),
  gender: joi.string().valid("male", "female", "other").required(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be 6-10 chars with upper, lower, number, and special char",
    }),
});

const validateLogIn = joi.object({
  email: joi
    .string()
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
    .email()
    .required()
    .messages({
      "string.pattern.base":
        "Email takes only lowercase letters, numbers, and common special characters.",
      "string.email": "Invalid email address.",
      "any.required": "Email is required.",
    }),
  password: joi.string().required().messages({
    "any.only": "Password is mandatory",
  }),
});

const validateForgetPassword = joi.object({
  token: joi.string(),
  password: joi
    .string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be 6-10 chars with upper, lower, number, and special char",
    }),
  repeatPassword: joi.ref("password"),
});

const validateChangePassword = joi
  .object({
    oldPassword: joi.string().required(),
    newPassword: joi
      .string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must be 6-10 chars with upper, lower, number, and special char",
      }),
    repeatNewPassword: joi
      .string()
      .valid(joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "repeatNewPassword must match newPassword",
      }),
  })
  .custom((value, helpers) => {
    if (value.oldPassword === value.newPassword) {
      return helpers.message("newPassword must be different from oldPassword");
    }
    return value;
  });

module.exports = {
  validateSignUp,
  validateLogIn,
  validateForgetPassword,
  validateChangePassword,
};
