const WebSocket = require("ws");
const redis = require("redis");

let publisher;
const clients = [];

// Initialize the websocket server
const initializeWebsocketServer = async (server) => {
    const client = redis.createClient({
        socket: {
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || "6379",
        },
    });

    // This is the subscriber part
    const subscriber = client.duplicate();
    await subscriber.connect();

    // This is the publisher part
    publisher = client.duplicate();
    await publisher.connect();

    const websocketServer = new WebSocket.Server({ server });

    websocketServer.on("connection", (ws) => onConnection(ws, subscriber));
    websocketServer.on("error", console.error);

    await subscriber.subscribe("newMessage", onRedisMessage);
    await publisher.publish("newMessage", "Hello from Redis!");
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws, subscriber) => {
    //console.log("New websocket connection");

    ws.on("close", () => onClose(ws));
    ws.on("message", (message) => onClientMessage(ws, message, subscriber));

    ws.send("Hello Client!");
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = (ws, message, subscriber) => {
    console.log("Message received: " + message);
    publisher.publish("newMessage", message);
};

// If a new message from the redis channel is received, the onRedisMessage function is called
const onRedisMessage = (channel, message) => {
    //console.log("Message received from Redis: " + message);
    clients.forEach((client) => {
        client.send(message);
    });
};

// If a connection is closed, the onClose function is called
const onClose = (ws) => {
    //console.log("Websocket connection closed");
    const index = clients.indexOf(ws);
    if (index !== -1) {
        clients.splice(index, 1);
    }
};

module.exports = { initializeWebsocketServer };
