const express = require("express");

const {
  handle500Errors,
  handleWrongPathErrors,
  handleCustomErrors,
  handleSQLErrors,
} = require("../controllers/errorHandlingControllers.js");

const apiRouter = require("../routes/api-router.js");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use(handleCustomErrors);
app.use(handleSQLErrors);
app.use(handleWrongPathErrors);
app.use(handle500Errors);

module.exports = app;
