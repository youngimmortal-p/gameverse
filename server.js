const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
// 🔗 CONNECT TO MONGODB ATLAS
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

// 📦 MODEL
const Ticket = mongoose.model("Ticket", {
  name: String,
  email: String,
  ticketId: String,
  used: { type: Boolean, default: false }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server running"));

// 🎟 CREATE TICKET
app.post("/create-ticket", async (req, res) => {
  const { name, email } = req.body;

  const ticketId = "GAME-" + Date.now();

  const ticket = await Ticket.create({
    name,
    email,
    ticketId
  });

  res.json(ticket);
});

// ✅ VALIDATE TICKET
app.post("/validate-ticket", async (req, res) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findOne({ ticketId });

  if (!ticket) return res.json({ status: "invalid" });

  if (ticket.used) return res.json({ status: "used" });

  ticket.used = true;
  await ticket.save();

  res.json({ status: "valid", name: ticket.name });
});

// 🚀 START SERVER
app.listen(3000, () => console.log("🚀 Server running on port 3000"));