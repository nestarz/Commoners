import hyperswarm from "hyperswarm";
import crypto from "crypto";

import limited from "./utils/create-swarm.js";

import setClient from "./client.js";
import setServer from "./server.js";

export default () => {
  const swarm = limited(hyperswarm());
  const topic = crypto.createHash("sha256").update("the-commoners").digest();
  swarm.join(topic, { lookup: true, announce: true });

  return {
    client: setClient(swarm),
    server: setServer(swarm),
  };
};
