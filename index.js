const express = require("express");
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/send", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  const LINE_TOKEN   = process.env.LINE_TOKEN;
  const LINE_USER_ID = process.env.LINE_USER_ID;

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_USER_ID,
        messages: [{ type: "text", text: message }],
      }),
    });
    if (response.ok) {
      res.json({ success: true });
    } else {
      const err = await response.text();
      res.status(500).json({ success: false, error: err });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/", (req, res) => res.send("LINE Bot Server OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
