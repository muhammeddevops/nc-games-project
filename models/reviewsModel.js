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
  const changedToNumber = +reviewId;
  if (isNaN(changedToNumber)) {
    return Promise.reject({ status: 400 });
  } else {
    return db
      .query(`SELECT * FROM reviews WHERE review_id = $1;`, [reviewId])
      .then((response) => {
        const selectedReviewArr = response.rows;
        console.log(selectedReviewArr);
        if (!selectedReviewArr.length) {
          return Promise.reject({ status: 404 });
        } else {
          return selectedReviewArr[0];
        }
      });
  }
};

module.exports = { fetchReviews, fetchReviewsById };
