const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware (MUST come before routes)
app.use(cors({
  origin: "https://gameverse-1.netlify.app",
  credentials: true
}));
app.use(express.json());

// 🔗 CONNECT TO MONGODB ATLAS
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if DB fails
  });

// 📦 MODEL
const Ticket = mongoose.model("Ticket", {
  name: { type: String, required: true },
  email: { type: String, required: true },
  ticketId: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false }
});

// 🎟 CREATE TICKET
app.post("/create-ticket", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email required" });
    }

    const ticketId = "GAME-" + Date.now();

    const ticket = await Ticket.create({
      name,
      email,
      ticketId
    });

    res.json({ 
      success: true, 
      ticket: ticketId,
      data: ticket 
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ VALIDATE TICKET
app.post("/validate-ticket", async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID required" });
    }

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.json({ status: "invalid" });
    }

    if (ticket.used) {
      return res.json({ status: "used" });
    }

    ticket.used = true;
    await ticket.save();

    res.json({ status: "valid", name: ticket.name });
  } catch (error) {
    console.error("Validate ticket error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🩺 HEALTH CHECK (important for Render)
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});