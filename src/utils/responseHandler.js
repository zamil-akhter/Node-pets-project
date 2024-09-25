let sendSuccess = (res, message) => {
  return res.status(200).json({ status: 200, message });
};

let sendSuccessWithData = (res, message, data) => {
  return res.status(200).json({ status: 200, message, data });
};

let sendError = (res, message) => {
  return res.status(400).json({ status: 400, message });
};

let sendUnauthorizeError = (res, message) => {
  return res.status(401).json({ status: 401, message });
};

let sendCatchError = (res, error) => {
  // return res.status(500).json({ status: 500, error: error.toString() }); //500
  return res.status(500).json({ status: 500, error: error.message }); //500
};

module.exports = {
  sendSuccess,
  sendSuccessWithData,
  sendError,
  sendUnauthorizeError,
  sendCatchError,
};
