import { EventEmitter } from "events";

const peerLink = (host, port) => `http://${host}:${port}`;

class Peers extends EventEmitter {
  constructor() {
    super();
    this.set = new Set();
  }
  add(peer) {
    this.set.add(peer);
    console.log(peerLink(peer.host, peer.port));
    this.emit("connection", peer);
  }
  delete(peer) {
    this.set.delete(peer);
    this.emit("disconnection", peer);
  }
  toList() {
    return Object.freeze([...this.set]);
  }
}

export default (swarm) => () => {
  const peers = new Peers();
  swarm.on("connection", (_, { peer }) => peer && peers.add(peer));
  swarm.on("disconnection", (_, { peer }) => peer && peers.delete(peer));
  return peers;
};
