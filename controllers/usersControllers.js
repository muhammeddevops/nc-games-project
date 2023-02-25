const { fetchUsers, fetchUserByUserName } = require("../models/usersModel.js");

const getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

const getUserByUsername = (request, response, next) => {
  const { username } = request.params;

  fetchUserByUserName(username)
    .then((user) => {
      console.log(user);
      response.status(200).send(user);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getUsers, getUserByUsername };
