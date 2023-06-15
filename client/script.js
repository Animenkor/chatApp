const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send-btn");
const messagesDiv = document.getElementById("messages");
const usersDiv = document.getElementById("users");

const ws = new WebSocket("ws://localhost:3000");

// Send a message to the server
function sendMessage() {
    const message = messageInput.value;

    if (message === "") return;
    ws.send(JSON.stringify(message));
    messageInput.value = "";
}

// Update the username
function updateUsername() {
    const newUsername = usernameInput.value;
    ws.send(JSON.stringify({ type: "updateUsername", username: newUsername }));
}

// Display a received message
function displayMessage(sender, message) {
    //TODO: Let own messages show to the left and others to the right
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

    messagesDiv.appendChild(messageElement);
}

// Display active users
function displayActiveUsers(usernames) {
    usersDiv.innerHTML = "";

    const titleElement = document.createElement("p");
    titleElement.classList.add("fwb", "curr-online");
    titleElement.innerText = "Currently online:";
    usersDiv.appendChild(titleElement);

    usernames.forEach((username) => {
        const userElement = document.createElement("p");
        userElement.classList.add("user");

        const iconElement = document.createElement("i");
        iconElement.classList.add("fa-solid", "fa-circle", "icon-online");
        userElement.appendChild(iconElement);

        const usernameText = document.createTextNode(username);
        userElement.appendChild(usernameText);

        usersDiv.appendChild(userElement);
    });
}

ws.onopen = () => {
    console.log("WebSocket connection established.");
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "username") {
        usernameInput.value = data.username;
    } else if (data.type === "activeUsers") {
        displayActiveUsers(data.usernames);
    } else {
        const { sender, message } = data;
        displayMessage(sender, message);
    }
};

sendButton.addEventListener("click", sendMessage);

usernameInput.addEventListener("change", updateUsername);

messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});
