# Commoners

Hyperswarm and [Kademlia DHT](https://en.wikipedia.org/wiki/Kademlia) File-based Social Network

## Structure

Four parts divide the project:

```
├── app
├── server
├── src
├── resources
```

### App

Contains Electron source files to build an easy to distribute GUI.

### Resources

Contains the Caddy binaries for each platform (currently only Darwin is supported).

### Server

Contains logic to start/end a Caddy server and serve folders using Webdav.

### Source

Contains the connection logic between peers HTTP server and client peers over the Hyperswarm Protocol.
