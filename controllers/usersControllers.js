const { fetchUsers } = require("../models/usersModel.js");

const getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getUsers };
