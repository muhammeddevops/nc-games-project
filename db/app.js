const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");

const app = express();

app.get("/api/categories", getCategories);

app.use((request, response, next) => {
  response.status(404).send({ msg: "Path not found" });
});

module.exports = app;
