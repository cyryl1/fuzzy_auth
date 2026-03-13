jest.mock("../src/models/User");

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

process.env.JWT_SECRET = "test_secret_key_12345";
process.env.JWT_EXPIRES_IN = "1h";

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /auth/register", () => {
  const validPayload = {
    username: "john_doe",
    email: "john@example.com",
    password: "Secret123",
  };

  it("registers a new user and returns a JWT", async () => {
    const savedUser = {
      _id: "abc123",
      username: "john_doe",
      email: "john@example.com",
      toJSON() {
        return { _id: this._id, username: this.username, email: this.email };
      },
    };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(savedUser);

    const res = await request(app).post("/auth/register").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({ username: "john_doe", email: "john@example.com" });
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("rejects registration when the email is already taken", async () => {
    User.findOne.mockResolvedValue({ email: "john@example.com", username: "other" });

    const res = await request(app).post("/auth/register").send(validPayload);

    expect(res.status).toBe(409);
  });

  it("rejects registration when the username is already taken", async () => {
    User.findOne.mockResolvedValue({ email: "other@example.com", username: "john_doe" });

    const res = await request(app)
      .post("/auth/register")
      .send({ ...validPayload, email: "other@example.com" });

    expect(res.status).toBe(409);
  });

  it("returns 400 for an invalid email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validPayload, email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the password has no numbers", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validPayload, password: "NoNumbers" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the username is too short", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validPayload, username: "ab" });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  const existingUser = {
    _id: "abc123",
    username: "john_doe",
    email: "john@example.com",
    verifyPassword: jest.fn(),
    toJSON() {
      return { _id: this._id, username: this.username, email: this.email };
    },
  };

  it("returns a JWT for valid credentials", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ...existingUser, verifyPassword: jest.fn().mockResolvedValue(true) }),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "john@example.com", password: "Secret123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("rejects login with the wrong password", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ...existingUser, verifyPassword: jest.fn().mockResolvedValue(false) }),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "john@example.com", password: "WrongPass1" });

    expect(res.status).toBe(401);
  });

  it("rejects login for an email that does not exist", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "Secret123" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/auth/login").send({ password: "Secret123" });

    expect(res.status).toBe(400);
  });
});
