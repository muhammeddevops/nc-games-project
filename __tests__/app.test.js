const request = require("supertest");
const app = require("../db/app.js");
const seed = require("../db/seeds/seed.js");
const connection = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");

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
            expect(category).toHaveProperty("slug");
            expect(category).toHaveProperty("description");
          });
        });
    });
  });

  describe("GET /api/reviews", () => {
    test("200: responds with an array of review objects, ordered by desc date , which should have 9 properties", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.reviews;
          const reviewsCopy = [...reviews];
          const sortedReviews = reviewsCopy.sort((reviewA, reviewB) => {
            return reviewA.created_at - reviewB.created_at;
          });
          expect(reviews.length).toBeGreaterThan(0);
          expect(sortedReviews).toEqual(reviews);
          reviews.forEach((review) => {
            expect(review).toHaveProperty("owner");
            expect(review).toHaveProperty("title");
            expect(review).toHaveProperty("review_id");
            expect(review).toHaveProperty("review_img_url");
            expect(review).toHaveProperty("created_at");
            expect(review).toHaveProperty("votes");
            expect(review).toHaveProperty("designer");
            expect(review).toHaveProperty("comment_count");
            expect(review).toHaveProperty("category");
          });
        });
    });
  });

  describe("GET /api/reviews/:review_id", () => {
    test("200: responds with a specific review object, which should have 9 properties", () => {
      return request(app)
        .get("/api/reviews/10")
        .expect(200)
        .then((response) => {
          const review = response.body;
          expect(review).toMatchObject({
            review_id: expect.any(Number),
            title: expect.any(String),
            review_body: expect.any(String),
            designer: expect.any(String),
            review_img_url: expect.any(String),
            votes: expect.any(Number),
            category: expect.any(String),
            owner: expect.any(String),
            created_at: expect.any(String),
          });
        });
    });
    test('404: responds with "Not Found" error', () => {
      return request(app)
        .get("/api/reviews/999")
        .expect(404)
        .then((response) => {
          const errorMessage = response.body.msg;
          expect(errorMessage).toBe("id provided does not exist");
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
});
