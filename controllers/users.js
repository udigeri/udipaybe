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

usersRouter.get("/:id", async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      response.status(404).end();
    } else {
      response.json(user);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:id", async (request, response, next) => {
  try {
    const user = await User.findByIdAndDelete(request.params.id);
    if (!user) {
      response.status(404).end();
    } else {
      response.status(204).end();
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", async (request, response, next) => {
  const body = request.body;

  const user = {
    email: body.email,
    admin: body.admin || false,
    name: body.name,
    updatedAt: Date.now(),
  };

  try {
    const userDummy = await User.findById(request.params.id);
    if (!userDummy) {
      return response.status(404).end();
    } 
    const updatedUser = await User.findByIdAndUpdate(
      request.params.id,
      user,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );
    if (!updatedUser) {
      response.status(404).end();
    } else {
      response.json(updatedUser);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
