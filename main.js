const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const SwarmHTTP = require("./swarm-http.js");

const swarmHTTP = new SwarmHTTP();
const { links, added, removed } = swarmHTTP.client();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
  const win = mainWindow.webContents;
  // win.openDevTools();
  win.on("did-finish-load", () => {
    win.send("joined", "ok");
    links.forEach((link) => !win.isDestroyed() && win.send("connection", link));
    added.on((link) => !win.isDestroyed() && win.send("connection", link));
    removed.on((link) => !win.isDestroyed() && win.send("disconnection", link));
    ipcMain.on("create", () =>
      dialog
        .showOpenDialog({ properties: ["openDirectory"] })
        .then(({ filePaths: [filePath] }) => swarmHTTP.server(filePath))
        .then((instance) => !win.isDestroyed() && win.send("server", instance))
    );
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
