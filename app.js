const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const middleware = require("./utils/middleware");
const usersRouter = require("./controllers/users");

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

app.get("/", async (request, response) => {
  response.send("<h2>UdiPayBe</h2>");
});

app.use("/api/users", usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
