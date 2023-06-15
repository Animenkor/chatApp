const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send-btn");
const messagesDiv = document.getElementById("messages");

const ws = new WebSocket("ws://localhost:3000");

// Send a message to the server
function sendMessage() {
    const message = messageInput.value;
    ws.send(JSON.stringify(message));
    messageInput.value = "";
}

// Display a received message
function displayMessage(sender, message) {
    console.log(message);
    const messageElement = document.createElement("div");
    messageElement.classList.add("msg");

    const username = document.createElement("p");
    username.classList.add("sender");
    username.innerText = sender;

    const msg = document.createElement("p");
    msg.classList.add("msg-content");
    msg.innerText = message;

    messageElement.appendChild(username);
    messageElement.appendChild(msg);

    const messagesDiv = document.getElementById("messages");
    messagesDiv.appendChild(messageElement);
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "username") {
        usernameInput.value = data.username;
    } else {
        const { sender, message } = data;
        displayMessage(sender, message);
    }
};

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});
