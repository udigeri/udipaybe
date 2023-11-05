const mongoose = require("mongoose");
const config = require("../utils/config");

const usersRouter = require("express").Router();
const User = require("../models/user");

mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGODB_URI)
  .then((result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

module.exports = usersRouter;