const jwt = require("jsonwebtoken");
const { sendCatchError } = require("../utils/responseHandler");


const generateToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.SECRET_KEY);
  } catch (e) {
    return sendCatchError(res, e);
  }
};

module.exports = {
  generateToken,
};
