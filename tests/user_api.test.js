const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./helper");

const app = require("../app");
const api = supertest(app);

const bcrypt = require("bcrypt");
const User = require("../models/user");

describe("when there in initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("admin", 10);

    const user = new User({
      email: "root@udipay.com",
      passwordHash: passwordHash,
      admin: true,
      name: "Super Admin",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await user.save();
  });

  test("check if one user really in db", async () => {
    const userAtStart = await helper.usersInDb();
    expect(userAtStart).toHaveLength(1);
  });

  test("fails with statuscode 404 if user non exist", async () => {
    const validNonExistingId = "6547e54fe3d743a7fba7769f";
    await api.get(`/api/users/${validNonExistingId}`).expect(404);
  });

  test("fails with statuscode 400 if user id is invalid", async () => {
    const invalidId = "16547e54fe3d743a7fba7769f";
    await api.get(`/api/users/${invalidId}`).expect(400);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
