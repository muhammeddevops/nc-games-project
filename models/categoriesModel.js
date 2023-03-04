const db = require("../db/connection.js");

const fetchCategories = () => {
  return db.query("SELECT * FROM categories;").then(({ rows: categories }) => {
    return categories;
  });
};

const fetchCategory = (category) => {
  let queryString = "SELECT * FROM categories WHERE slug = $1";
  const queryValues = [category];

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({ status: 404, msg: "Category not found" });
    } else return rows[0];
  });
};

const addCategory = (newCategory) => {
  return db
    .query(
      `INSERT INTO categories
      (slug, description)
      VALUES
      ($1, $2)
      RETURNING *;`,
      [newCategory.slug, newCategory.description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = { fetchCategories, fetchCategory, addCategory };
