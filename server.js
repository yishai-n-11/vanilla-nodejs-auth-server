const http = require("http");
const PORT = 5454;
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const secret = "some secret";

const homePath = path.join(__dirname + "/./views/home.html");
const loginPath = path.join(__dirname + "/./views/login.html");
const registerPath = path.join(__dirname + "/./views/register.html");

const server = http
  .createServer(async (req, res) => {
    const { url, headers, method } = req;
    console.log("method", method);
    console.log("url", url);
    if (url === "/") {
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
      res.writeHead(200, { "content-type": "text/html" });
      const stream = fs.createReadStream(registerPath);
      stream.pipe(res);
    }
  })
  .listen(PORT);
console.log(`server listening on ${PORT}`);