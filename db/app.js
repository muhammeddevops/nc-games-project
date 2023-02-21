const express = require("express");
const { getCategories } = require("../controllers/categoriesController.js");
const { getReviews } = require("../controllers/reviewsController.js");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.use((request, response, next) => {
  response.status(404).send({ msg: "Path not found" });
});

module.exports = app;
