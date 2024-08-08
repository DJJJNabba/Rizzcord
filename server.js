const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(cors());

let messages = [];

app.get("/", (req, res) => {
  res.json({ messages });
});

app.post("/", (req, res) => {
  const { username, color, message } = req.body;
  if (username && color && message) {
    messages.push({ username, color, message });
    res.json({ message: "Message received!" });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
