#!/usr/bin/env node

import createSwarmHTTP from "./index.js";

const swarmHTTP = createSwarmHTTP();

function cli(command, ...args) {
  const actions = {
    [undefined]: () => serve(),
    server: () => swarmHTTP.server(args[0] || "."),
    client: () => swarmHTTP.client(),
  };

  if (command in actions) actions[command]();
  else console.error("Error in command. Supported: ", Object.keys(actions));
}

console.log(`HyperCommons`);
cli(...process.argv.slice(2));
