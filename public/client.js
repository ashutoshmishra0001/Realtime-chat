// Connect to the Socket.IO server
const socket = io();
let username = ""; // Will hold the user's name after joining

// Get references to HTML elements
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const typingIndicator = document.getElementById("typingIndicator");

// Function to set the username when user joins
function setUsername() {
  const nameInput = document.getElementById("usernameInput");
  const name = nameInput.value.trim();

  if (name) {
    username = name;

    // Hide the username prompt overlay
    document.getElementById("usernamePrompt").style.display = "none";

    // Notify the server of the new user
    socket.emit("new user", username);
  }
}

// Handle message submission
form.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent page reload on form submit

  if (input.value) {
    // Send message to server
    socket.emit("chat message", {
      user: username,
      text: input.value,
    });

    input.value = ""; // Clear the input box
  }
});

// Receive a chat message from the server
socket.on("chat message", (data) => {
  const item = document.createElement("li");

  // Format timestamp (if valid)
  const timeObj = new Date(data.time);
  const formattedTime =
    timeObj instanceof Date && !isNaN(timeObj)
      ? timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Invalid Time";

  // Create message with timestamp
  item.innerHTML = `<strong>${data.user}</strong> [${formattedTime}]: ${data.text}`;
  messages.appendChild(item);

  // Auto-scroll to latest message
  messages.scrollTop = messages.scrollHeight;
});

// Emit typing event when user types
input.addEventListener("input", () => {
  socket.emit("typing", username);
});

// Show "is typing..." message when server notifies
socket.on("typing", (user) => {
  typingIndicator.innerText = `${user} is typing...`;

  // Clear the typing message after 1.5 seconds
  setTimeout(() => {
    typingIndicator.innerText = "";
  }, 1500);
});

// Show system messages (e.g., user joined or left)
socket.on("system message", (msg) => {
  const item = document.createElement("li");
  item.style.fontStyle = "italic";
  item.style.color = "gray";
  item.textContent = msg;
  messages.appendChild(item);
});
