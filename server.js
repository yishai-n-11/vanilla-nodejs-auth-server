const http = require("http");
const PORT = 5454;
const fs = require("fs");
const path = require("path");
const secret = "some secret";
const jwt = require("jsonwebtoken");

const homePath = path.join(__dirname + "/./views/home.html");
const loginPath = path.join(__dirname + "/./views/login.html");
const registerPath = path.join(__dirname + "/./views/register.html");

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
          location: "http://localhost:5454/login",
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
          location: "http://localhost:5454/login",
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
        const passwrod = searchParams.get("password");
        res.writeHead(303, {
          location: "http://localhost:5454/",
        });
        res.end();
        return;
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
        const passwrod = searchParams.get("password");
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
