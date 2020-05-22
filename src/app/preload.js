const { ipcRenderer, shell } = require("electron");

ipcRenderer.on("connection", (event, message) => {
  console.log(message);
  const link = document
    .getElementById("servers")
    .appendChild(Object.assign(document.createElement("li"), { id: message }))
    .appendChild(
      Object.assign(document.createElement("a"), {
        innerText: message,
        href: message,
      })
    );

  link.addEventListener("click", (event) => {
    event.preventDefault();
    shell.openExternal(event.target.href);
  });
});

ipcRenderer.on("disconnection", (event, message) =>
  document.getElementById(message).remove()
);

ipcRenderer.on("server", (event, message) => {
  document.getElementById("create-server").disabled = true;
  document
    .getElementById("server-info")
    .append(
      Object.assign(document.createElement("span"), { innerText: message.root })
    );
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("create-server").addEventListener("click", () => {
    ipcRenderer.send("create");
  });
});
