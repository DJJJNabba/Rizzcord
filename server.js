const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(cors());

let messages = [];

app.get("/messages", (req, res) => {
  const { roomCode } = req.query;
  if (roomCode) {
    const filteredMessages = messages.filter(msg => msg.roomCode === roomCode);
    res.json({ messages: filteredMessages });
  } else {
    res.status(400).json({ message: "Room code is required" });
  }
});

app.post("/messages", (req, res) => {
  const { username, color, message, roomCode } = req.body;
  if (username && color && message && roomCode) {
    messages.push({ username, color, message, roomCode });
    res.json({ message: "Message received!" });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
