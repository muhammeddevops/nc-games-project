const { fetchApi } = require("../models/apiModel.js");

const getApi = (request, response, next) => {
  fetchApi().then((listOfApis) => {
    response.status(200).send(listOfApis);
  });
};
module.exports = { getApi };
