const db = require("../db/connection.js");

const fetchCommentsOfReview = (reviewId) => {
  return db
    .query(
      `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC`,
      [reviewId]
    )
    .then((response) => {
      const commentsOfReview = response.rows;
      return commentsOfReview;
    });
};

module.exports = { fetchCommentsOfReview };
