const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", (event) => {
    console.log("WebSocket connected!");

    // Generate a username on the first connection
    const username = generateUsername();
    document.getElementById("username").value = username;
    socket.send(username);
});

socket.addEventListener("message", (event) => {
    const messageObj = JSON.parse(event.data);
    const messageContainer = document.getElementById("message-container");
    const newMessage = document.createElement("div");
    newMessage.innerText = messageObj;
    messageContainer.appendChild(newMessage);
});

socket.addEventListener("close", (event) => {
    console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
});

function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const usernameInput = document.getElementById("username");

    const message = messageInput.value;
    const username = usernameInput.value;

    if (message && username) {
        const msg = {
            type: "message",
            message: {
                username,
                message,
            },
            sentAt: new Date().toLocaleTimeString(),
        };
        socket.send(JSON.stringify(msg));

        messageInput.value = "";
    }
}

function generateUsername() {
    const adjectives = ["Happy", "Sad", "Excited", "Brave", "Clever", "Gentle", "Honest", "Kind", "Polite", "Silly"];

    const nouns = ["Cat", "Dog", "Elephant", "Lion", "Tiger", "Monkey", "Penguin", "Dolphin", "Butterfly", "Owl"];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return adjective + noun;
}
