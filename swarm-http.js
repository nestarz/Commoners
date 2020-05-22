const hyperswarm = require("hyperswarm");
const crypto = require("crypto");

const net = require("net");
const servor = require("servor");

const createEventListener = () => {
  const callbackList = [];
  return {
    on: (callback) => callbackList.push(callback),
    emit: (...data) => callbackList.forEach((callback) => callback(...data)),
  };
};

module.exports = class SwarmHTTP {
  constructor(topicid = "eleonora-francesca-elias-stigmergy") {
    this.swarm = hyperswarm();
    const topic = crypto.createHash("sha256").update(topicid).digest();
    this.swarm.join(topic, {
      lookup: true,
      announce: true,
    });

    this.callbacks = {};
    this.connections = {};
    this.swarm.on("connection", (socket, details) => {
      this.connections[socket.id] = { socket, details };
      this.callbacks?.connection?.forEach((callback) =>
        callback(socket, details)
      );
    });
    this.swarm.on("disconnection", (socket, details) => {
      delete this.connections[socket.id];
      this.callbacks?.disconnection?.forEach((callback) =>
        callback(socket, details)
      );
    });
  }

  on(event, callback) {
    Object.values(this.connections).forEach(({ socket, details }) =>
      callback(socket, details)
    );
    this.callbacks[event] = [...(this.callbacks[event] ?? []), callback];
  }

  client() {
    const added = createEventListener();
    const removed = createEventListener();
    const links = new Set();
    const createLinkFromPeer = ({ host, port }) => `http://${host}:${port}`;

    this.on("connection", (socket, details) => {
      if (!details.peer) return;
      const link = createLinkFromPeer(details.peer);
      links.add(link);
      added.emit(link);
    });

    this.on("disconnection", (socket, details) => {
      if (!details.peer) return;
      const link = createLinkFromPeer(details.peer);
      links.delete(link);
      removed.emit(link);
    });

    return { added, removed, links };
  }

  async server(root) {
    const server = await servor({
      root,
      fallback: "index.html",
      module: false,
      static: true,
      silent: true,
      reload: false,
    });

    this.on("connection", (socket) => {
      socket.on("data", (message) => {
        const service = new net.Socket();
        service.connect(server.port, "127.0.0.1", () => service.write(message));
        service.on("data", (data) => socket.write(data));
      });
    });

    return server;
  }
};
