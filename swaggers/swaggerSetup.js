const swaggerUi = require("swagger-ui-express");
const yamlJS = require("yamljs");
const path = require("path");

const swaggerDocument = yamlJS.load(path.join(__dirname, "swagger.yaml"));

module.exports = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
