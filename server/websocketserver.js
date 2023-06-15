const WebSocket = require("ws");
const redis = require("redis");

const redisClient = redis.createClient();

let activeUsers = [];

// Generate a random username
function generateRandomUsername() {
    const adjectives = ["Happy", "Sad", "Funny", "Serious", "Crazy", "Clever", "Brave"];
    const nouns = ["Cat", "Dog", "Elephant", "Lion", "Tiger", "Bear", "Monkey"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}-${randomNoun}`;
}

// Create WebSocket server
function initializeWebsocketServer(server) {
    const wss = new WebSocket.Server({ server });

    // Handle WebSocket connections
    wss.on("connection", (ws) => {
        // Generate a random username for the new user
        const username = generateRandomUsername();

        // Save the WebSocket connection in the active users array
        activeUsers.push(ws);

        // Send the generated username to the new user
        ws.send(JSON.stringify({ type: "username", username }));

        // Broadcast a user joined message
        broadcastMessage(username, "joined the chat");

        // Handle incoming messages from the user
        ws.on("message", (message) => {
            // Parse the received message as JSON
            const parsedMessage = JSON.parse(message);
            console.log(activeUsers);

            // Broadcast the parsed message to all active users
            broadcastMessage(username, parsedMessage);
        });

        // Handle WebSocket disconnections
        ws.on("close", () => {
            // Remove the WebSocket connection from the active users array
            activeUsers = activeUsers.filter((client) => client !== ws);

            // Broadcast a user left message
            broadcastMessage(username, "left the chat");
        });
    });
}

// Broadcast a message to all active users
function broadcastMessage(sender, message) {
    const data = JSON.stringify({ sender, message });

    activeUsers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

module.exports = { initializeWebsocketServer };
