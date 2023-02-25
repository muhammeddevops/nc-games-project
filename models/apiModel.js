const fs = require("fs/promises");

const fetchApi = () => {
  return fs.readFile(`./endpoints.json`).then((data) => {
    const endpoints = JSON.parse(data);
    return { endpoints };
  });
};

module.exports = { fetchApi };
