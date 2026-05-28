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
 
app.post("/send", async (req, res) => {
  const { message } = req.body;
  console.log("收到請求, message:", message ? message.slice(0, 50) : "無");
  
  if (!message) return res.status(400).json({ error: "message is required" });
 
  const LINE_TOKEN = process.env.LINE_TOKEN;
  const LINE_USER_ID = process.env.LINE_USER_ID;
 
  console.log("TOKEN 前20字:", LINE_TOKEN ? LINE_TOKEN.slice(0, 20) : "無");
  console.log("USER_ID:", LINE_USER_ID);
 
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
 
    const responseText = await response.text();
    console.log("LINE 回應狀態:", response.status);
    console.log("LINE 回應內容:", responseText);
 
    if (response.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: responseText });
    }
  } catch (e) {
    console.log("錯誤:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
 
app.get("/", (req, res) => res.send("LINE Bot Server OK"));
 
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
