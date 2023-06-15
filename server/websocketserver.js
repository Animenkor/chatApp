const WebSocket = require("ws");
const redis = require("redis");

const redisClient = redis.createClient();

let activeUsers = [];

//TODO: Make Docker Image
//TODO: Publish to Dockerhub
//TODO: Deploy on Kubernetes

function generateRandomNumber() {
    const min = 1000000;
    const max = 9999999;

    // Generate a random number within the specified range
    let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

// Generate a random username
function generateRandomUsername() {
    const chars = [
        "Frodo",
        "Gandalf",
        "Aragorn",
        "Legolas",
        "Gimli",
        "Samwise",
        "Merry",
        "Pippin",
        "Boromir",
        "Galadriel",
        "Elrond",
        "Gollum",
        "Saruman",
        "Sauron",
        "Eowyn",
        "Treebeard",
        "Theoden",
    ];
    const char = chars[Math.floor(Math.random() * chars.length)];

    const num = generateRandomNumber();
    return `${char}-${num}`;
}

// Create WebSocket server
function initializeWebsocketServer(server) {
    const wss = new WebSocket.Server({ server });

    // Handle WebSocket connections
    wss.on("connection", (ws) => {
        // Generate a random username for the new user
        const username = generateRandomUsername();

        // Save the WebSocket connection and username in the active users array
        const user = { ws, username };
        activeUsers.push(user);

        // Send the generated username to the new user
        ws.send(JSON.stringify({ type: "username", username }));

        // Broadcast a user joined message
        broadcastMessage(username, "joined the chat");
        broadcastActiveUsernames();

        // Handle incoming messages from the user
        ws.on("message", (message) => {
            // Parse the received message as JSON
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type === "updateUsername") {
                // Update the username for the user
                user.username = parsedMessage.username;
                broadcastActiveUsernames();
            } else {
                // Broadcast the parsed message to all active users
                broadcastMessage(user.username, parsedMessage);
            }
        });

        // Handle WebSocket disconnections
        ws.on("close", () => {
            // Remove the user from the active users array
            activeUsers = activeUsers.filter((u) => u !== user);

            // Broadcast a user left message
            broadcastMessage(user.username, "left the chat");
            broadcastActiveUsernames();
        });
    });
}

// Broadcast a message to all active users
function broadcastMessage(sender, message) {
    const data = JSON.stringify({ sender, message });

    activeUsers.forEach((user) => {
        if (user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(data);
        }
    });
}

// Broadcast active usernames to all users
function broadcastActiveUsernames() {
    const usernames = activeUsers.map((user) => user.username);
    const data = JSON.stringify({ type: "activeUsers", usernames });

    activeUsers.forEach((user) => {
        if (user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(data);
        }
    });
}

module.exports = { initializeWebsocketServer };
