const express = require("express");
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/webhook", (req, res) => {
  const events = req.body.events || [];
  events.forEach(event => {
    const source = event.source;
    if (source && source.type === "group") {
      console.log("群組 ID:", source.groupId);
    }
  });
  res.sendStatus(200);
});

app.post("/send", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  const LINE_TOKEN = process.env.LINE_TOKEN;
  const LINE_GROUP_ID = process.env.LINE_GROUP_ID;
  const LINE_USER_ID = process.env.LINE_USER_ID;
  const to = LINE_GROUP_ID || LINE_USER_ID;

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`,
      },
      body: JSON.stringify({
        to: to,
        messages: [{ type: "text", text: message }],
      }),
    });
    const responseText = await response.text();
    console.log("LINE 回應:", response.status, responseText);
    if (response.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: responseText });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/", (req, res) => res.send("LINE Bot Server OK"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
