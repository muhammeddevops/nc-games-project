# 🎲 MK Board Games Backend API 🎲

Welcome to MK Board Games Backend API Backend API! This project is the backend for the MK Board Games React App. It acts as a bridge between the frontend and the database, allowing users to interact with the data by making HTTP requests through the API. This backend service stores the information about the reviews, likes, comments and users, and enables the frontend to retrieve, add, modify, and delete that data as necessary.

## 💻 Hosted Version 💻

The hosted version of the API can be found at https://nc-games-uawn.onrender.com/api

## Cloning and Dependencies

To clone this project to your local machine, use the following command:

```
git clone https://github.com/muhammeddevops/nc-games-project
```

Install the dependencies by running the following command:

```
npm install
```

The following dependencies will be installed:

dotenv
express
pg
pg-format

## Environment Variables

There are two .env files that need to be created: .development and .test. The .development file should contain the following environment variables:

PGDATABASE=<database_name>

The .test file should contain the same environment variable as the .development file, but with a different PGDATABASE name.

## 🌱 Seeding the data bases 🌱

To set up and seed the databases, run the following commands:

```
npm run setup-dbs
npm run seed
```

## 🧪️ Testing 🧪️

To run the tests for this project, you'll need to install the following devDependencies:

jest
jest-extended
supertest

You can install these dependencies by running the following command:

```
npm install --save-dev jest jest-extended supertest
```

To run the tests, enter the following command:

```
npm test
```

### Minimum Versions

The minimum versions of Node.js and Postgres needed to run this project are:

Node.js: v18.12.0
Postgres: v12.0

Thank you for using MK Board Games Backend API!
