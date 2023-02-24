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
          const reviews = body.reviews;

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
          const comments = body;

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
          const comments = body;
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

  describe("GET /api/reviews (queries)", () => {
    test("200: Should respond with all reviews if no query given and sort by date desc", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.reviews;
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
          const reviewsArr = body.reviews;

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
          const reviewsArr = body.reviews;
          expect(reviewsArr).toBeSortedBy("votes", { descending: true });
        });
    });

    test("200: Should sort reviews by any valid category specified", () => {
      return request(app)
        .get("/api/reviews?sort_by=designer")
        .expect(200)
        .then(({ body }) => {
          const reviewsArr = body.reviews;
          expect(reviewsArr).toBeSortedBy("designer", { descending: true });
        });
    });

    test("200: Should sort reviews by ascending order, if specified", () => {
      return request(app)
        .get("/api/reviews?order_by=ASC")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.reviews;
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
          const reviewsArr = body.reviews;
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
          const reviewsArr = body.reviews;

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
        .then((response) => {
          expect(response.body.msg).toBe(
            "Please select a valid sort-by option!"
          );
        });
    });

    test("400: Should respond with a Bad request error if order by is invalid", () => {
      return request(app)
        .get("/api/reviews?order_by=invalid")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Please order by ascending or descending"
          );
        });
    });
  });
});
