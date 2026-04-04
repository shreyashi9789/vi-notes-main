const express = require("express");
const Session = require("../models/Session");
const auth = require("../middleware/auth");

const router = express.Router();

// CREATE SESSION
router.post("/create", auth, async (req, res) => {
  try {
    console.log("UserID:", req.userId);   
    console.log("Body:", req.body); 
    const { content, keystrokes } = req.body;

    const session = new Session({
      userId: req.userId,
      content,
      keystrokes,
    });

    await session.save();

    res.json({ message: "Session saved" });
    res.json({ analysis: "Human-like" });
  } catch (err) {
  console.log("ERROR:", err); 
  res.status(500).json({ message: "Error saving session" });
}
});


module.exports = router;