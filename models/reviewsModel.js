const db = require("../db/connection.js");

const fetchReviews = (sortBy = "created_at", orderBy = "DESC", category) => {
  const queryValues = [];

  if (category) {
    category = category.toLowerCase();
  }

  const validOrderOptions = ["ASC", "DESC"];
  const validCategories = ["euro game", "social deduction", "dexterity"];
  const validSortByProperties = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];

  if (!validSortByProperties.includes(sortBy)) {
    return Promise.reject({
      status: 400,
      msg: "invalid sort_by",
    });
  }
  if (!validOrderOptions.includes(orderBy)) {
    return Promise.reject({
      status: 400,
      msg: "Please select a valid order-by option",
    });
  }

  let queryString = `SELECT reviews.*, 
  COUNT(comment_id) AS comment_count 
  FROM reviews 
  LEFT JOIN comments 
  ON comments.review_id = reviews.review_id `;

  if (category !== undefined && !validCategories.includes(category)) {
    return Promise.reject({
      status: 404,
      msg: "Category not found",
    });
  } else if (validCategories.includes(category) && category !== undefined) {
    queryValues.push(category);
    queryString += ` WHERE reviews.category = $1 `;
  }
  queryString += `GROUP BY reviews.review_id ORDER BY ${sortBy} ${orderBy};`;

  return db.query(queryString, queryValues).then(({ rows }) => {
    return rows;
  });
};

const fetchReviewsById = (reviewId) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1;`, [reviewId])
    .then(({ rows }) => {
      const selectedReviewArr = rows;
      if (!selectedReviewArr.length) {
        return Promise.reject({ status: 404 });
      } else {
        return selectedReviewArr[0];
      }
    });
};

const updateReviewVotesById = (reviewId, votesInc) => {
  return db
    .query(
      `UPDATE reviews
  SET votes = votes + $1
  WHERE review_id = $2
  RETURNING *`,
      [votesInc, reviewId]
    )
    .then(({ rows }) => {
      const updatedReviewArr = rows;
      if (!updatedReviewArr.length) {
        return Promise.reject({ status: 404 });
      } else {
        return updatedReviewArr[0];
      }
    });
};

module.exports = { fetchReviews, fetchReviewsById, updateReviewVotesById };
