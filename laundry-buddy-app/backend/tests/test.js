const request = require("supertest");
const { disconnectDB, isConnected } = require("../src/config/db");
const { server } = require("../src/server");
const { stopInterval, clearBlacklistedToken } = require("../src/models/Token");

const TEST_USERNAME_AND_PASSWORD = "asdf";
const TEST_EMAIL = "asdf@example.com";
const NOVEL_USERNAME_AND_PASSWORD = "never-before-seen username and password";
const NOVEL_EMAIL = "never-before-seen@coolmail.com";

let token;

beforeAll(async () => {
  if (!isConnected()) {
    throw new Error('MongoDB not connected!');
  }
});

afterAll(async () => {
  stopInterval();
  await disconnectDB();
  server.close();
});

// TODO: test if email is valid

describe("Login Test", () => {
  test("should return access token on successful login", async () => {
    const res = await request(server).post("/api/auth/login").send({
      username: TEST_USERNAME_AND_PASSWORD,
      password: TEST_USERNAME_AND_PASSWORD,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
    const tokenParts = res.body.token.split(".");
    expect(tokenParts.length).toBe(3); // JWT tokens have three parts separated by dots
  });
  
  test("should return 400 if no username entered", async () => {
    const res = await request(server).post("/api/auth/login").send({
      username: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Please provide username");
  });
  
  test("should return 400 if user doesn't exist", async () => {
    const res = await request(server).post("/api/auth/login").send({
      username: NOVEL_USERNAME_AND_PASSWORD,
    });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("User does not exist");
  });

  test("should return 400 if no password entered", async () => {
    const res = await request(server).post("/api/auth/login").send({
      username: TEST_USERNAME_AND_PASSWORD,
      password: "",
    });
  
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Please provide password");
  });

  test("should return 401 if incorrect password entered", async () => {
    const res = await request(server).post("/api/auth/login").send({
      username: TEST_USERNAME_AND_PASSWORD,
      password: NOVEL_USERNAME_AND_PASSWORD,
    });
  
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe("Password is incorrect");
  });
});

describe("Logout Test", () => {
  test("should invalidate token from Login Test", async () => {
    const res = await request(server).post("/api/auth/logout").set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Logged out successfully");
  });

  test("should return 403 if the same token is used to logout", async () => {
    const res = await request(server).post("/api/auth/logout").set("Authorization", token);

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe("Blacklisted token used, authorization denied");
    
  });

  test("revalidates token by clearing recently blacklisted token from database", async () => {
    const result = await clearBlacklistedToken(token);
    expect(result).toBeTruthy();
  })
});

describe("Get User Test", () => {
  test("should return username and email given token from Login Test", async () => {
    const res = await request(server).get("/api/user/profile").set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.username).toBe(TEST_USERNAME_AND_PASSWORD);
    expect(res.body.email).toBe(TEST_EMAIL);
  });

  test("should return 401 if no token provided", async () => {
    const res = await request(server).get("/api/user/profile").set("Authorization", "");

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe("No token, authorization denied");
  });
});

describe("Register Test", () => {
  test("should return 400 if username already exists", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: TEST_USERNAME_AND_PASSWORD,
      email: NOVEL_EMAIL, 
      password: NOVEL_USERNAME_AND_PASSWORD,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Username is already in use, please provide a different username");
  });

  test("should return 400 if email already exists", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: NOVEL_USERNAME_AND_PASSWORD,
      email: TEST_EMAIL, 
      password: NOVEL_USERNAME_AND_PASSWORD,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("This email address is already been registered");
  });

  test("should return access token on successful register", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: NOVEL_USERNAME_AND_PASSWORD,
      email: NOVEL_EMAIL, 
      password: NOVEL_USERNAME_AND_PASSWORD,
    });
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
    const tokenParts = res.body.token.split(".");
    expect(tokenParts.length).toBe(3); // JWT tokens have three parts separated by dots
  });

  test("should return 400 if no username entered", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: "",
      email: NOVEL_EMAIL, 
      password: NOVEL_USERNAME_AND_PASSWORD,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Please provide username, email, and password");
  });

  test("should return 400 if no email entered", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: NOVEL_USERNAME_AND_PASSWORD,
      email: "", 
      password: NOVEL_USERNAME_AND_PASSWORD,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Please provide username, email, and password");
  });

  test("should return 400 if no password entered", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: NOVEL_USERNAME_AND_PASSWORD,
      email: NOVEL_EMAIL, 
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Please provide username, email, and password");
  });
});

describe("Delete User Test", () => {
  test("should return delete user given token from Register Test", async () => {
    const res = await request(server).delete("/api/user/profile").set("Authorization", token);

    expect(res.body.msg).toBe("User deleted");
  });

  test("should return 404 if the same token is used again", async () => {
    const res = await request(server).delete("/api/user/profile").set("Authorization", token);
    
    expect(res.statusCode).toBe(404);
  });
});