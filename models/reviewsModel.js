const db = require("../db/connection.js");

const fetchReviews = () => {
  return db
    .query(
      `SELECT reviews.*, 
      COUNT(comment_id) AS comment_count 
      FROM reviews 
      LEFT JOIN comments 
      ON comments.review_id = reviews.review_id 
      GROUP BY reviews.review_id 
      ORDER BY created_at DESC;`
    )
    .then(({ rows: reviews }) => {
      return reviews;
    })
    .catch((err) => {
      console.log(err);
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
