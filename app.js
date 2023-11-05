const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.json());
app.use(
  morgan(
    ":remote-addr :method :url :status :response-time ms - :res[content-length]bytes :body"
  )
);

module.exports = app;
