#!/usr/bin/env node
import path from "path";
import { platform } from "os";

import createSwarmHTTP from "./index.js";

const swarmHTTP = createSwarmHTTP();
const executablePath = path.join("resources", platform(), "bin");

function cli(command, ...args) {
  const actions = {
    [undefined]: () => serve(),
    server: () => swarmHTTP.server(executablePath, args[0] || "."),
    client: () => swarmHTTP.client(),
  };

  if (command in actions) actions[command]();
  else console.error("Error in command. Supported: ", Object.keys(actions));
}

console.log(`HyperCommons`);
cli(...process.argv.slice(2));
