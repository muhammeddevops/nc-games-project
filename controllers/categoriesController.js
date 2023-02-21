const { fetchCategories } = require("../models/categoriesModel.js");

const getCategories = (request, response, next) => {
  fetchCategories().then((categories) => {
    response.status(200).send({ categories });
  });
};

module.exports = { getCategories };
