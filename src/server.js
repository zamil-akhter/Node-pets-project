require("dotenv").config();
const app = require("./app");
const dbConnection = require("./config/dbConnection");
const { sendCatchError } = require("./utils/responseHandler");

const port = process.env.PORT;

(async () => {
  try {
    await dbConnection.databaseConnection();
    app.listen(port, () => {
      console.log(`Server is listening on port http://localhost:${port}`);
    });
  } catch (e) {
    return sendCatchError(res, e);
  }
})();
