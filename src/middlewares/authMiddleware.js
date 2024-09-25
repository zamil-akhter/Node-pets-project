const jwt = require("jsonwebtoken");
const { sendCatchError,sendError } = require("../utils/responseHandler");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return sendError(res, "Authorization header missing");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(res, "Token is mising");
    }
    const user = jwt.verify(token, process.env.SECRET_KEY);
    req.user = user;
    next();
  } catch (error) {
    return sendCatchError(res, error);
  }
};

module.exports = {
  verifyToken,
};
