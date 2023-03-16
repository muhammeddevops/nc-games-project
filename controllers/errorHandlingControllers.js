const handleWrongPathErrors = (request, response, next) => {
  response.status(404).send({ msg: "Path not found" });
};

const handle500Errors = (error, request, response, next) => {
  response.status(500).send({ msg: "There has been a server error!" });
};

const handleSQLErrors = (error, request, response, next) => {
  if (error.code === "22P02" || error.code === "23502") {
    response.status(400).send({ msg: "Bad request" });
  } else if (error.code === "23503") {
    response.status(404).send({ msg: "Not found" });
  } else if (error.code === "2201W") {
    response.status(400).send({ msg: "Limit provided is invalid" });
  }
};

const handleCustomErrors = (error, request, response, next) => {
  if (error.msg === "Error 404 page not found!") {
    response.status(404).send({ msg: "Error 404 page not found!" });
  } else if (error.msg === "Please select a valid order-by option") {
    response
      .status(400)
      .send({ msg: "Please order by ascending or descending" });
  } else if (error.msg === "Category not found") {
    response.status(404).send({ msg: "Please select a valid category!" });
  } else if (error.msg === "User not found") {
    response.status(404).send({ msg: "User not found" });
  } else if (error.msg === "invalid sort_by") {
    response.status(400).send({ msg: "Please select a valid sort-by option!" });
  } else if (error.msg === "invalid comment id") {
    response.status(404).send({ msg: "Invalid comment id" });
  } else if (error.msg === "Limit must be more than 0") {
    response.status(400).send({ msg: "Limit must be more than 0" });
  } else if (error.status === 404) {
    response.status(404).send({ msg: "Value provided does not exist" });
  } else {
    next(error);
  }
};
module.exports = {
  handleWrongPathErrors,
  handle500Errors,
  handleCustomErrors,
  handleSQLErrors,
};
