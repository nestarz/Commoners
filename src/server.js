import net from "net";
import caddyAdapter from "../server/index.js";

export default (swarm) => async (binaries, root) => {
  const instance = await caddyAdapter(binaries, root);
  console.log(`Local CaddyWebdav: http://localhost:${instance.port}`);
  swarm.on("connection", (socket) => {
    socket.on("data", (message) => {
      const service = new net.Socket();
      service
        .connect(instance.port, "127.0.0.1", () => service.write(message))
        .on("data", (data) => socket.write(data))
        .on("error", console.error);
    });
  });

  return { root };
};
