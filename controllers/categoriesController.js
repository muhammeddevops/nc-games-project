const {
  fetchCategories,
  addCategory,
} = require("../models/categoriesModel.js");

const getCategories = (request, response, next) => {
  fetchCategories()
    .then((categories) => {
      response.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

const postCategory = (request, response, next) => {
  const newCategory = request.body;

  addCategory(newCategory)
    .then((postedCategory) => {
      response.status(201).send(postedCategory);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getCategories, postCategory };
