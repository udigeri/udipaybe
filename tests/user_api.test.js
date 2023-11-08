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

  test("create succeeds with statuscode 201 if user is valid", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      email: "user@udipay.com",
      password: "user",
      name: "User User",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const emails = usersAtEnd.map((u) => u.email);
    expect(emails).toContain(newUser.email);
  });

  test("create fails with statuscode 400 if user email not unique", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      email: usersAtStart[0].email,
      password: "user",
      name: "User User",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("create fails with statuscode 400 if missing required field", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      email: "user@udipay.com",
      password: "user",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
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

  test("update succeeds with statuscode 200 if user is valid", async () => {
    const usersAtStart = await helper.usersInDb();
    const userToBeUpdated = usersAtStart[0];
    userToBeUpdated.email = "root@udipaybetest.com";
    userToBeUpdated.admin = false;

    const res = await api
      .put(`/api/users/${userToBeUpdated.id}`)
      .send(userToBeUpdated)
      .expect(200);

    const userAtEnd = res.body;
    expect(userAtEnd.email).toBe(userToBeUpdated.email);
    expect(userAtEnd.admin).toBe(userToBeUpdated.admin);
  });

  test("update fails with statuscode 404 if user non exist", async () => {
    const usersAtStart = await helper.usersInDb();
    const userToBeUpdated = usersAtStart[0];
    userToBeUpdated.admin = false;

    const res = await api
      .put(`/api/users/6547e54fe3d743a7fba7769f`)
      .send(userToBeUpdated)
      .expect(404);
  });

  test("update fails with statuscode 400 if user id is invalid", async () => {
    const invalidId = "16547e54fe3d743a7fba7769f";
    await api.put(`/api/users/${invalidId}`).expect(400);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
