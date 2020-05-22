export default (swarm) => {
  const callbacks = { connection: [], disconnection: [] };
  const connections = {};
  swarm.on("connection", (socket, details) => {
    connections[socket.id] = { socket, details };
    callbacks.connection.forEach((callback) => callback(socket, details));
  });
  swarm.on("disconnection", (socket, details) => {
    delete connections[socket.id];
    callbacks.disconnection.forEach((callback) => callback(socket, details));
  });

  return {
    join: (...args) => swarm.join(...args),
    connections: Object.freeze({ ...connections }),
    on: (event, callback) => {
      callbacks[event] = [...(callbacks[event] || []), callback];
      Object.values(connections).forEach(({ socket, details }) =>
        callback(socket, details)
      );
    },
  };
};
