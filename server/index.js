import { spawn } from "child_process";
import net from "net";
import http from "http";

const checkPort = (port) =>
  new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once("error", (err) => reject(err))
      .once("listening", () =>
        tester.once("close", () => resolve(port)).close()
      )
      .listen(port);
  });

const random = (a, b) => a + (Math.floor(Math.random() * b) - a);

const safe = (child) => {
  [
    "beforeExit",
    "exit",
    "SIGINT",
    "SIGUSR1",
    "SIGUSR2",
    "uncaughtException",
  ].forEach((event) =>
    process.on(event, (err) => {
      console.error(err);
      child.kill();
      process.exit();
    })
  );
  return child;
};

export default (root, port) =>
  checkPort(2019)
    .then(
      () =>
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(), 15000);
          safe(spawn("./server/caddy", ["run"])).stderr.on("data", (chunk) => {
            // console.log(chunk.toString());
            try {
              const started = chunk
                .toString()
                .split("\n")
                .filter((v) => v)
                .map(JSON.parse)
                .some(({ msg }) => msg === "admin endpoint started");
              if (started) {
                clearTimeout(timeout);
                resolve();
              }
            } catch {}
          });
        })
    )
    .catch(() => console.warn(":2019 not available, trying anyway..."))
    .then(() => (port ? checkPort(port) : random(5001, 30000)))
    .then((port) => {
      const config = JSON.stringify({
        apps: {
          http: {
            servers: {
              srv0: {
                listen: [`:${port}`],
                routes: [
                  {
                    handle: [
                      {
                        handler: "webdav",
                        root,
                      },
                    ],
                    match: [{ path: ["/*"] }],
                  },
                ],
              },
            },
          },
        },
      });

      const options = {
        host: "localhost",
        port: 2019,
        path: "/load",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": config.length,
        },
      };

      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) =>
          res.statusCode === 200
            ? resolve({ port })
            : reject(new Error(`Status Code: ${res.statusCode}`))
        );
        req.on("error", reject);
        req.write(config);
        req.end();
      });
    });
