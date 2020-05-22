import net from "net";
import servor from "servor";

export default (swarm) => async (root) => {
  const server = await servor({ root, static: true, reload: false });

  swarm.on("connection", (socket) => {
    socket.on("data", (message) => {
      const service = new net.Socket();
      service
        .connect(server.port, "127.0.0.1", () => service.write(message))
        .on("data", (data) => socket.write(data));
    });
  });

  return server;
};
