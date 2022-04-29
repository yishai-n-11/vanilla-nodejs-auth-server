const http = require("http");
const PORT = 5454;
const fs = require("fs");
const path = require("path");
const secret = "some secret";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const homePath = path.join(__dirname + "/./views/home.html");
const loginPath = path.join(__dirname + "/./views/login.html");
const registerPath = path.join(__dirname + "/./views/register.html");
const usersPath = path.join(__dirname + "/./data/users.json");

const server = http
  .createServer(async (req, res) => {
    const { url, headers, method } = req;
    console.log("method", method);
    console.log("url", url);
    if (url === "/") {
      // check if there is a token, and validate it
      const cookie = req.headers.cookie;
      console.log("cookie", cookie);
      if (!cookie) {
        res.writeHead(303, {
          location: "http://localhost:5454/register",
        });
        res.end();
        return;
      }
      const token = cookie.split("=")[1];
      try {
        const dec = jwt.decode(token);
        console.log("dec", dec);
      } catch (error) {
        console.log("error", error);
        res.writeHead(303, {
          location: "http://localhost:5454/register",
        });
        res.end();
        return;
      }
      res.writeHead(200, { "content-type": "text/html" });
      const stream = fs.createReadStream(homePath);
      stream.pipe(res);
    } else if (url === "/login") {
      if (method === "GET") {
        res.writeHead(200, { "content-type": "text/html" });
        const stream = fs.createReadStream(loginPath);
        stream.pipe(res);
      } else if (method === "POST") {
        const buffs = [];
        for await (const chunk of req) {
          buffs.push(chunk);
        }
        const data = Buffer.concat(buffs).toString("utf-8");
        let searchParams = new URLSearchParams(data);
        const username = searchParams.get("username");
        const password = searchParams.get("password");
        // load stored users, compare username and stored hashed password
        const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
        console.log("users", users);
        let isAuth = false;
        users.forEach((user) => {
          console.log("user in loop", user);
          if (user.username === username) {
            const storedPass = user.password;
            const isTrue = bcrypt.compareSync(password, storedPass);
            console.log("isTrue", isTrue);
            isAuth = isTrue;
          }
        });
        if (isAuth) {
          res.writeHead(303, {
            location: "http://localhost:5454/",
          });
          res.end();
          return;
        } else {
          res.writeHead(303, {
            location: "http://localhost:5454/register",
          });
          res.end();
          return;
        }
      }
    } else if (url === "/register") {
      if (method === "GET") {
        res.writeHead(200, { "content-type": "text/html" });
        const stream = fs.createReadStream(registerPath);
        stream.pipe(res);
      } else if (method === "POST") {
        const buffs = [];
        for await (const chunk of req) {
          buffs.push(chunk);
        }
        const data = Buffer.concat(buffs).toString("utf-8");
        let searchParams = new URLSearchParams(data);
        const username = searchParams.get("username");
        const password = searchParams.get("password");
        // store user name and hashed password in data
        const storedUsers = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
        console.log("storedUsers", storedUsers);
        bcrypt.hash(password, 10, (err, hashed) => {
          if (err) {
            console.log("err", err);
          } else {
            console.log("hashed", hashed);
            storedUsers.push({ username, password: hashed });
            fs.writeFileSync(usersPath, JSON.stringify(storedUsers));
          }
        });
        const token = jwt.sign(
          {
            user: username,
            status: "allowed",
          },
          secret
        );
        res.writeHead(301, {
          "set-cookie": `token=${token}`,
          location: "http://localhost:5454/",
        });
        res.end();
      }
    }
  })
  .listen(PORT);
console.log(`server listening on ${PORT}`);
