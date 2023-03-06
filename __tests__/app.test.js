const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const jestSorted = require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return connection.end();
});

describe("app", () => {
  describe("Server errors", () => {
    test("404: responds with error msg when given valid but non-existent path", () => {
      return request(app)
        .get("/faulty-path")
        .expect(404)
        .then((response) => {
          response;
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Path not found");
        });
    });
  });

  describe("GET /api/categories", () => {
    test("200: responds with an array of category objects", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body }) => {
          const categories = body.categories;
          expect(categories).toHaveLength(4);
          categories.forEach((category) => {
            expect(category).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });

  describe("GET /api/reviews", () => {
    test("200: responds with an array of review objects, ordered by desc date ,each of which, should have 9 properties", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.results;

          expect(reviews).toBeSortedBy("created_at", { descending: true });

          reviews.forEach((review) => {
            expect(review).toMatchObject({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String),
              category: expect.any(String),
            });
          });
        });
    });
  });

  describe("GET /api/reviews/:review_id/comments", () => {
    test("200: responds with an array of comment objects if review has comments, ordered by desc date , each of which, should have 6 properties", () => {
      return request(app)
        .get("/api/reviews/3/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body.results;

          expect(comments).toBeSortedBy("created_at", { descending: true });

          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              review_id: expect.any(Number),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
            });
          });
        });
    });

    test("200: responds with an empty array if review has no comments", () => {
      return request(app)
        .get("/api/reviews/5/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body.results;
          expect(comments).toEqual([]);
        });
    });

    test('404: responds with "Not found" error if given a non existent review id', () => {
      return request(app)
        .get("/api/reviews/999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Value provided does not exist");
        });
    });

    test("400: responds with bad request error if not given a number ", () => {
      return request(app)
        .get("/api/reviews/words-not-num/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });

  describe("GET /api/reviews/:review_id", () => {
    test("200: responds with a specific review object, which should have 9 properties", () => {
      return request(app)
        .get("/api/reviews/3")
        .expect(200)
        .then((response) => {
          const review = response.body;
          expect(review.review_id).toBe(3);
          expect(review.title).toBe("Ultimate Werewolf");
          expect(review.review_body).toBe("We couldn't find the werewolf!");
          expect(review.designer).toBe("Akihisa Okui");
          expect(review.review_img_url).toBe(
            "https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700"
          );
          expect(review.votes).toBe(5);
          expect(review.category).toBe("social deduction");
          expect(review.owner).toBe("bainesface");
          expect(review.created_at).toBe("2021-01-18T10:01:41.251Z");
          expect(review.comment_count).toBe(3);
        });
    });
    test("200: Should have a comment_count key which is the number of comments on a review ", () => {
      return request(app)
        .get("/api/reviews/2")
        .expect(200)
        .then(({ body: review }) => {
          expect(review.comment_count).toBe(3);
        });
    });
    test('404: responds with "Not Found" error', () => {
      return request(app)
        .get("/api/reviews/999")
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Value provided does not exist");
        });
    });

    test('400: responds with "Bad request" error', () => {
      return request(app)
        .get("/api/reviews/not-a-number")
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("POST /api/reviews/:review_id/comments, adds comment to a review", () => {
    test("201: should respond with newly posted comment", () => {
      const newComment = {
        body: "My family loved this game too!",
        username: "mallionaire",
      };
      return request(app)
        .post("/api/reviews/2/comments")
        .send(newComment)
        .expect(201)
        .then((response) => {
          const postedComment = response.body;
          expect(postedComment.author).toBe("mallionaire");
          expect(postedComment.body).toBe("My family loved this game too!");
          expect(postedComment.comment_id).toBe(7);
          expect(postedComment.review_id).toBe(2);
          expect(postedComment.votes).toBe(0);
        });
    });

    test("201: Should ignore any extra keys on comment and post without the extra keys", () => {
      const newComment = {
        body: "I dont like your review!",
        username: "bainesface",
        randomKey: "irrelevant",
      };
      return request(app)
        .post("/api/reviews/4/comments")
        .send(newComment)
        .expect(201)
        .then((response) => {
          const postedComment = response.body;
          expect(postedComment.author).toBe("bainesface");
          expect(postedComment.body).toBe("I dont like your review!");
          expect(postedComment.comment_id).toBe(7);
          expect(postedComment.review_id).toBe(4);
          expect(postedComment.votes).toBe(0);
        });
    });

    test("404: should return not found error when review is not found", () => {
      const newComment = {
        body: "The game was not that good, I think youre exaggerating",
        username: "dav3rid",
      };
      return request(app)
        .post("/api/reviews/999/comments")
        .send(newComment)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Not found");
        });
    });

    test("400: Should return a bad request error if comment has incorrect properties", () => {
      const newComment = {
        randomKey: "notWhatYouNeed",
      };
      return request(app)
        .post("/api/reviews/3/comments")
        .send(newComment)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });

    test("404: Should return a not found error when the username is non existent", () => {
      const newComment = {
        body: "im not a user but i still want to comment",
        username: "Lebron J",
      };
      return request(app)
        .post("/api/reviews/3/comments")
        .send(newComment)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Not found");
        });
    });
    test("400: should return Bad request error when given a id that is not a number", () => {
      const newComment = {
        body: "I like this review",
        username: "philippaclaire9",
      };
      return request(app)
        .post("/api/reviews/not-a-num/comments")
        .send(newComment)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("PATCH /api/reviews/:review_id", () => {
    test("200: should respond with the updated review", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedReview = body;
          expect(updatedReview.votes).toBe(8);
          expect(updatedReview.review_id).toBe(1);
          expect(updatedReview.title).toBe("Agricola");
          expect(updatedReview.review_body).toBe("Farmyard fun!");
          expect(updatedReview.designer).toBe("Uwe Rosenberg");
          expect(updatedReview.review_img_url).toBe(
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700"
          );
          expect(updatedReview.category).toBe("euro game");
          expect(updatedReview.owner).toBe("mallionaire");
          expect(updatedReview.created_at).toBe("2021-01-18T10:00:20.514Z");
        });
    });

    test("200: Should decrease the vote count if increment is a negative number", () => {
      const voteIncrement = { inc_votes: -1 };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedReview = body;
          expect(updatedReview.votes).toBe(0);
        });
    });

    test("200: Should ignore any extra keys on the object and return review correctly patched", () => {
      const voteIncrement = { inc_votes: 7, randomKey: "irrelevant" };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedReview = body;
          expect(updatedReview.votes).toBe(8);
        });
    });

    test("404: Should respond with a not found error if review id is non existent", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/999")
        .send(voteIncrement)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Value provided does not exist");
        });
    });
    test("400: Should respond with a Bad request error if increment is not a number", () => {
      const voteIncrement = { inc_votes: "not-a-num" };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
    test("400: should respond with a Bad request error if no increment is provided", () => {
      const voteIncrement = { randomKey: "random" };
      return request(app)
        .patch("/api/reviews/1")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
    test("400: should respond with a Bad request error if review id is not a number", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/reviews/not-a-num")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("GET /api/reviews (queries)", () => {
    test("200: Should respond with all reviews if no query given and sort by date desc", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.results;
          expect(reviews).toBeSortedBy("created_at", { descending: true });
          reviews.forEach((review) => {
            expect(review).toMatchObject({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String),
              category: expect.any(String),
            });
          });
        });
    });

    test("200: Responds with reviews which match the category and are sorted by date desc", () => {
      return request(app)
        .get("/api/reviews?category=social+deduction")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
          reviewsArr.forEach((review) => {
            expect(review.category).toBe("social deduction");
          });
        });
    });

    test("200: Should sort reviews by any valid category specified", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toBeSortedBy("votes", { descending: true });
        });
    });

    test("200: Should sort reviews by any valid category specified", () => {
      return request(app)
        .get("/api/reviews?sort_by=designer")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toBeSortedBy("designer", { descending: true });
        });
    });

    test("200: Should sort reviews by ascending order, if specified", () => {
      return request(app)
        .get("/api/reviews?order_by=ASC")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.results;
          expect(reviews).toBeSortedBy("created_at", { ascending: true });
        });
    });

    test("200: Should respond correctly when all three queries are used together", () => {
      return request(app)
        .get(
          "/api/reviews?category=social+deduction&sort_by=title&order_by=ASC"
        )
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toBeSortedBy("title", { ascending: true });
          reviewsArr.forEach((review) => {
            expect(review.category).toBe("social deduction");
          });
        });
    });

    test("200: Should ignore any extra queries that are not category, sort or order by ", () => {
      return request(app)
        .get("/api/reviews?randomKey=irrelevant&category=social+deduction")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;

          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
          reviewsArr.forEach((review) => {
            expect(review.category).toBe("social deduction");
          });
        });
    });

    test("404: Should respond with not found error if the category does not exist", () => {
      return request(app)
        .get("/api/reviews?category=non-existent")
        .expect(404)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Please select a valid category!");
        });
    });

    test("400: Should respond with a Bad request error if passed an invalid sort_by option", () => {
      return request(app)
        .get("/api/reviews?sort_by=invalid")
        .expect(400)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Please select a valid sort-by option!");
        });
    });

    test("400: Should respond with a Bad request error if order by is invalid", () => {
      return request(app)
        .get("/api/reviews?order_by=invalid")
        .expect(400)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Please order by ascending or descending");
        });
    });
  });

  describe("DELETE /api/comments/:comment_id", () => {
    test("204: Should delete the specified comment and return status 204 with no content", () => {
      return request(app).delete("/api/comments/5").expect(204);
    });
    test("404: Should respond with a Not found error if passed an id that is valid but does not exist", () => {
      return request(app)
        .delete("/api/comments/999")
        .expect(404)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Invalid comment id");
        });
    });
    test("400: Should respond with a Bad request error if passed an id that is not a string", () => {
      return request(app)
        .delete("/api/comments/invalid")
        .expect(400)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("200: GET /api", () => {
    test("200: Should return a json object describing all the available endpoints that the API has", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const endpoints = body.endpoints;
          expect(endpoints).toMatchObject({
            "GET /api": expect.any(Object),
            "GET /api/categories": expect.any(Object),
            "GET /api/reviews": expect.any(Object),
            "GET /api/reviews/:review_id": expect.any(Object),
            "GET /api/reviews/:review_id/comments": expect.any(Object),
            "POST /api/reviews/:review_id/comments": expect.any(Object),
            "PATCH /api/reviews/:review_id": expect.any(Object),
            "GET /api/users": expect.any(Object),
            "DELETE /api/comments/:comment_id": expect.any(Object),
          });
        });
    });
  });

  describe("GET /api/users/:username", () => {
    test("returns a user object with the keys:- username, avatar_url and name", () => {
      return request(app)
        .get("/api/users/bainesface")
        .expect(200)
        .then(({ body }) => {
          const user = body;
          expect(user.username).toBe("bainesface");
          expect(user.name).toBe("sarah");
          expect(user.avatar_url).toBe(
            "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4"
          );
        });
    });
    test("when given an invalid username, return an appropriate response", () => {
      return request(app)
        .get("/api/users/invalid")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("User not found");
        });
    });
  });

  describe("PATCH /api/comments/:comment_id", () => {
    test("200: should respond with the updated comment", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/comments/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedComment = body;
          expect(updatedComment.votes).toBe(23);
          expect(updatedComment.review_id).toBe(2);
          expect(updatedComment.author).toBe("bainesface");
          expect(updatedComment.body).toBe("I loved this game too!");
          expect(updatedComment.comment_id).toBe(1);
          expect(updatedComment.created_at).toBe("2017-11-22T12:43:33.389Z");
        });
    });

    test("200: Should decrease the vote count if increment is a negative number", () => {
      const voteIncrement = { inc_votes: -1 };
      return request(app)
        .patch("/api/comments/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedComment = body;
          expect(updatedComment.votes).toBe(15);
        });
    });

    test("200: Should ignore any extra keys on the object and return review correctly patched", () => {
      const voteIncrement = { inc_votes: 7, randomKey: "irrelevant" };
      return request(app)
        .patch("/api/comments/1")
        .send(voteIncrement)
        .expect(200)
        .then(({ body }) => {
          const updatedComment = body;
          expect(updatedComment.votes).toBe(23);
        });
    });

    test("404: Should respond with a not found error if review id is non existent", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/comments/999")
        .send(voteIncrement)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Value provided does not exist");
        });
    });
    test("400: Should respond with a Bad request error if increment is not a number", () => {
      const voteIncrement = { inc_votes: "not-a-num" };
      return request(app)
        .patch("/api/comments/1")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
    test("400: should respond with a Bad request error if no increment is provided", () => {
      const voteIncrement = { randomKey: "random" };
      return request(app)
        .patch("/api/comments/1")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
    test("400: should respond with a Bad request error if review id is not a number", () => {
      const voteIncrement = { inc_votes: 7 };
      return request(app)
        .patch("/api/comments/not-a-num")
        .send(voteIncrement)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("POST /api/reviews", () => {
    test("201: should accept review object and respond with posted review that has a key of comment count", () => {
      const newReview = {
        owner: "bainesface",
        title: "Interesting review",
        review_body: "Great game",
        designer: "Abdullah",
        category: "dexterity",
        review_img_url: "randomUrl",
      };
      return request(app)
        .post(`/api/reviews`)
        .send(newReview)
        .expect(201)
        .then(({ body }) => {
          const review = body;
          expect(review).toHaveProperty("review_id", 14);
          expect(review).toHaveProperty("owner", "bainesface");
          expect(review).toHaveProperty("title", "Interesting review");
          expect(review).toHaveProperty("review_body", "Great game");
          expect(review).toHaveProperty("designer", "Abdullah");
          expect(review).toHaveProperty("category", "dexterity");
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("votes", 0);
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("comment_count", expect.any(Number));
        });
    });

    test("201: Should ignore any extra keys on review and post without the extra keys", () => {
      const newReview = {
        owner: "bainesface",
        title: "Interesting review",
        review_body: "Great game",
        designer: "Abdullah",
        category: "dexterity",
        review_img_url: "randomUrl",
        randomKey: "irrelevant",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(201)
        .then(({ body }) => {
          const review = body;
          expect(review).toHaveProperty("review_id", 14);
          expect(review).toHaveProperty("owner", "bainesface");
          expect(review).toHaveProperty("title", "Interesting review");
          expect(review).toHaveProperty("review_body", "Great game");
          expect(review).toHaveProperty("designer", "Abdullah");
          expect(review).toHaveProperty("category", "dexterity");
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("votes", 0);
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("comment_count", expect.any(Number));
        });
    });

    test("201: should provide default url if not provided", () => {
      const newReview = {
        owner: "bainesface",
        title: "Interesting review",
        review_body: "Great game",
        designer: "Abdullah",
        category: "dexterity",
      };
      return request(app)
        .post(`/api/reviews`)
        .send(newReview)
        .expect(201)
        .then(({ body }) => {
          const review = body;
          expect(review).toHaveProperty("review_id", 14);
          expect(review).toHaveProperty("owner", "bainesface");
          expect(review).toHaveProperty("title", "Interesting review");
          expect(review).toHaveProperty("review_body", "Great game");
          expect(review).toHaveProperty("designer", "Abdullah");
          expect(review).toHaveProperty("category", "dexterity");
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("votes", 0);
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("comment_count", expect.any(Number));
        });
    });

    test("400: Should return a bad request error if review has incorrect properties", () => {
      const newReview = {
        randomKey: "notWhatYouNeed",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });

    test("404: Should return a not found error when the username is non existent", () => {
      const newReview = {
        owner: "Ronaldo",
        title: "Interesting review",
        review_body: "Great game",
        designer: "Abdullah",
        category: "dexterity",
        review_img_url: "randomUrl",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Not found");
        });
    });
  });

  describe("GET /api/reviews (pagination)", () => {
    test("200: Should have a default limit of 10 results", () => {
      return request(app)
        .get("/api/reviews?category=social+deduction")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(10);
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
          reviewsArr.forEach((review) => {
            expect(review.category).toBe("social deduction");
          });
        });
    });

    test("200: Should allow limit to be adjusted", () => {
      return (
        request(app)
          // limit of 5
          .get("/api/reviews?category=social+deduction&limit=5")
          .expect(200)
          .then(({ body }) => {
            const reviewsArr = body.results;
            expect(reviewsArr).toHaveLength(5);
            expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
            reviewsArr.forEach((review) => {
              expect(review.category).toBe("social deduction");
            });
          })
      );
    });

    test("200: Should display a total_count property correctly", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(10);
          expect(body.total_count).toBe(13);
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Should have a page property which defaults to 1 and a range property, that gives the range of results on the given page", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(10);
          expect(body.total_count).toBe(13);
          expect(body.page).toBe(1);
          expect(body.range).toBe("Showing results 1 to 10");
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Should allow any page to be chosen", () => {
      return request(app)
        .get("/api/reviews?p=2")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(body.total_count).toBe(13);
          expect(reviewsArr).toHaveLength(3);
          expect(body.page).toBe(2);
          expect(body.range).toBe("Showing results 11 to 13");
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Should alter the range correctly to match the results on the page", () => {
      return request(app)
        .get("/api/reviews?limit=5&p=2")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(5);
          expect(body.total_count).toBe(13);
          expect(body.page).toBe(2);
          expect(body.range).toBe("Showing results 6 to 10");
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Should alter the range correctly when on the last page and the num of results is less than the limit", () => {
      return request(app)
        .get("/api/reviews?limit=5&p=3")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(3);
          expect(body.total_count).toBe(13);
          expect(body.page).toBe(3);
          expect(body.range).toBe("Showing results 11 to 13");
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Should alter the range correctly when on the last page with only one result", () => {
      return request(app)
        .get("/api/reviews?category=social+deduction&limit=5&p=3")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(1);
          expect(body.total_count).toBe(11);
          expect(body.page).toBe(3);
          expect(body.range).toBe("Showing result 11 of 11");
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Should allow all 5 queries to be used simultaneously", () => {
      return request(app)
        .get(
          "/api/reviews?category=social+deduction&limit=5&p=2&sort_by=review_id&order_by=ASC"
        )
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(5);
          expect(body.total_count).toBe(11);
          expect(body.page).toBe(2);
          expect(body.range).toBe("Showing results 6 to 10");
          expect(reviewsArr).toBeSortedBy("review_id", { ascending: true });
        });
    });

    test("200: Should ignore any extra invalid queries", () => {
      return request(app)
        .get(
          "/api/reviews?category=social+deduction&limit=5&p=2&sort_by=review_id&order_by=ASC&random=irrelevant"
        )
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(5);
          expect(body.total_count).toBe(11);
          expect(body.page).toBe(2);
          expect(body.range).toBe("Showing results 6 to 10");
          expect(reviewsArr).toBeSortedBy("review_id", { ascending: true });
        });
    });

    test("200: Should return max results if limit is higher than total count", () => {
      return request(app)
        .get("/api/reviews?category=social+deduction&limit=999")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.results;
          expect(reviewsArr).toHaveLength(11);
          expect(body.page).toBe(1);
          expect(body.range).toBe("Showing results 1 to 11");
          expect(reviewsArr).toBeSortedBy("created_at", { descending: true });
          reviewsArr.forEach((review) => {
            expect(review.category).toBe("social deduction");
          });
        });
    });

    describe("Pagination: Error handling", () => {
      test("404: Should return a not found error when page selected does not exist", () => {
        return request(app)
          .get("/api/reviews?p=999")
          .expect(404)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Error 404 page not found!");
          });
      });
      test("400: Should return bad request error if limit 0", () => {
        return request(app)
          .get("/api/reviews?category=social+deduction&limit=0")
          .expect(400)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Limit must be more than 0");
          });
      });

      test("400: Should return a bad request error when a non number is given for page", () => {
        return request(app)
          .get("/api/reviews?p=not-a-num")
          .expect(400)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Bad request");
          });
      });

      test("400: Should return a bad request error when a non number is given for limit", () => {
        return request(app)
          .get("/api/reviews?limit=not-a-num")
          .expect(400)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Bad request");
          });
      });
    });
  });

  describe("GET /api/reviews/:review_id/comments (pagination)", () => {
    test("200: Should have a default limit of 10 results", () => {
      return request(app)
        .get("/api/reviews/3/comments")
        .expect(200)
        .then(({ body }) => {
          const commentsArr = body.results;
          expect(commentsArr).toHaveLength(3);
        });
    });

    test("200: Should allow limit to be adjusted", () => {
      return (
        request(app)
          // limit of 5
          .get("/api/reviews/3/comments?limit=2")
          .expect(200)
          .then(({ body }) => {
            const commentsArr = body.results;
            expect(commentsArr).toHaveLength(2);
          })
      );
    });

    test("200: Should display a total_count property correctly", () => {
      return request(app)
        .get("/api/reviews/3/comments?limit=2")
        .expect(200)
        .then(({ body }) => {
          const commentsArr = body.results;
          expect(commentsArr).toHaveLength(2);
          expect(body.total_count).toBe(3);
        });
    });

    test("200: Should have a page property which defaults to 1 and a range property, that gives the range of results on the given page", () => {
      return request(app)
        .get("/api/reviews/3/comments?limit=2")
        .expect(200)
        .then(({ body }) => {
          const commentsArr = body.results;
          expect(commentsArr).toHaveLength(2);
          expect(body.total_count).toBe(3);
          expect(body.page).toBe(1);
          expect(body.range).toBe("Showing results 1 to 2");
        });
    });

    test("200: Should allow any page to be chosen", () => {
      return request(app)
        .get("/api/reviews/3/comments?limit=2&p=2")
        .expect(200)
        .then(({ body }) => {
          const commentsArr = body.results;
          expect(commentsArr).toHaveLength(1);
          expect(body.page).toBe(2);
          expect(body.range).toBe("Showing result 3 of 3");
        });
    });

    test("200: Should ignore any extra invalid queries", () => {
      return request(app)
        .get("/api/reviews/3/comments?limit=2&p=2&randomKey=irrelevant")
        .expect(200)
        .then(({ body }) => {
          const commentsArr = body.results;
          expect(commentsArr).toHaveLength(1);
          expect(body.page).toBe(2);
          expect(body.range).toBe("Showing result 3 of 3");
        });
    });

    test("200: Should have a page property which defaults to 1 and a range property, that gives the range of results on the given page", () => {
      return request(app)
        .get("/api/reviews/3/comments?limit=999")
        .expect(200)
        .then(({ body }) => {
          const commentsArr = body.results;
          expect(commentsArr).toHaveLength(3);
          expect(body.total_count).toBe(3);
          expect(body.page).toBe(1);
          expect(body.range).toBe("Showing results 1 to 3");
        });
    });

    describe("Pagination: Error handling", () => {
      test("404: Should return a not found error when page selected does not exist", () => {
        return request(app)
          .get("/api/reviews/3/comments?p=999")
          .expect(404)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Error 404 page not found!");
          });
      });
      test("400: Should return bad request error if limit 0", () => {
        return request(app)
          .get("/api/reviews/3/comments?limit=0")
          .expect(400)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Limit must be more than 0");
          });
      });

      test("400: Should return a bad request error when a non number is given for page", () => {
        return request(app)
          .get("/api/reviews/3/comments?p=not-a-num")
          .expect(400)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Bad request");
          });
      });

      test("400: Should return a bad request error when a non number is given for limit", () => {
        return request(app)
          .get("/api/reviews/3/comments?limit=not-a-num")
          .expect(400)
          .then(({ body }) => {
            const errorMessage = body.msg;
            expect(errorMessage).toBe("Bad request");
          });
      });
    });
  });

  describe("POST /api/categories", () => {
    test("201: should accept category object and respond with posted category", () => {
      const newCategory = {
        slug: "category name here",
        description: "description here",
      };
      return request(app)
        .post(`/api/categories`)
        .send(newCategory)
        .expect(201)
        .then(({ body }) => {
          const category = body;
          expect(category).toHaveProperty("slug", "category name here");
          expect(category).toHaveProperty("description", "description here");
        });
    });

    test("201: Should ignore any extra keys on category and post without the extra keys", () => {
      const newCategory = {
        slug: "category name here",
        description: "description here",
        randomKey: "irrelevant",
      };
      return request(app)
        .post(`/api/categories`)
        .send(newCategory)
        .expect(201)
        .then(({ body }) => {
          const category = body;
          expect(category).toHaveProperty("slug", "category name here");
          expect(category).toHaveProperty("description", "description here");
        });
    });

    test("400: Should return a bad request error if category has incorrect properties", () => {
      const newCategory = {
        randomKey: "notWhatYouNeed",
      };
      return request(app)
        .post("/api/categories")
        .send(newCategory)
        .expect(400)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });

  describe("DELETE /api/reviews/:review_id", () => {
    test("204: Should delete the specified review and return status 204 with no content", () => {
      return request(app).delete("/api/reviews/5").expect(204);
    });
    test("404: Should respond with a Not found error if passed an id that is valid but does not exist", () => {
      return request(app)
        .delete("/api/reviews/999")
        .expect(404)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Value provided does not exist");
        });
    });
    test("400: Should respond with a Bad request error if passed an id that is not a string", () => {
      return request(app)
        .delete("/api/reviews/invalid")
        .expect(400)
        .then(({ body }) => {
          const errorMessage = body.msg;
          expect(errorMessage).toBe("Bad request");
        });
    });
  });
});
