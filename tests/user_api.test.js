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

  test("check only one user really in db", async () => {
    const usersAtStart = await helper.usersInDb();
    expect(usersAtStart).toHaveLength(1);
    const emails = usersAtStart.map((r) => r.email);
    expect(emails).toContain("root@udipay.com");
  });

  test("fails with statuscode 404 if user non exist", async () => {
    const validNonExistingId = "6547e54fe3d743a7fba7769f";
    await api.get(`/api/users/${validNonExistingId}`).expect(404);
  });

  test("fails with statuscode 400 if user id is invalid", async () => {
    const invalidId = "16547e54fe3d743a7fba7769f";
    await api.get(`/api/users/${invalidId}`).expect(400);
  });

  test("delete succeeds with statuscode 204 if user is valid", async () => {
    const usersAtStart = await helper.usersInDb();
    const userToBeDeleted = usersAtStart[0];
    await api.delete(`/api/users/${userToBeDeleted.id}`).expect(204);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length - 1);

    const emails = usersAtEnd.map((r) => r.email);
    expect(emails).not.toContain(userToBeDeleted.email);
  });

  test("delete fails with statuscode 404 if user non exist", async () => {
    const usersAtStart = await helper.usersInDb();
    const userToBeDeleted = usersAtStart[0];
    await api.delete(`/api/users/6547e54fe3d743a7fba7769f`).expect(404);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);

    const emails = usersAtEnd.map((r) => r.email);
    expect(emails).toContain(userToBeDeleted.email);
  });

  test("delete fails with statuscode 400 if user id is invalid", async () => {
    const invalidId = "16547e54fe3d743a7fba7769f";
    await api.delete(`/api/users/${invalidId}`).expect(400);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
