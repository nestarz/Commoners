import path from "path";
import { app } from "electron";
import getPlatform from "./get-platform.js";

const IS_PROD = process.env.NODE_ENV === "production";
const root = process.cwd();

const binariesPath =
  IS_PROD && app.isPackaged
    ? path.join(path.dirname(app.getAppPath()), "..", "./Resources", "./bin")
    : path.join(root, "./resources", getPlatform(), "./bin");

export const execPath = path.resolve(binariesPath);
