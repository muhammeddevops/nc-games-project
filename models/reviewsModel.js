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
<<<<<<< HEAD
  const changedToNumber = +reviewId;
  if (isNaN(changedToNumber)) {
=======
  const changeToNumber = +reviewId;
  if (isNaN(changeToNumber)) {
>>>>>>> 5e35f7160bfbecb54d496077307a7896754b9925
    return Promise.reject({ status: 400 });
  } else {
    return db
      .query(`SELECT * FROM reviews WHERE review_id = $1;`, [reviewId])
      .then((response) => {
        const selectedReviewArr = response.rows;
<<<<<<< HEAD
        if (!selectedReviewArr.length) {
=======
        if (selectedReviewArr.length === 0) {
>>>>>>> 5e35f7160bfbecb54d496077307a7896754b9925
          return Promise.reject({ status: 404 });
        } else {
          return selectedReviewArr[0];
        }
      });
  }
};

module.exports = { fetchReviews, fetchReviewsById };
