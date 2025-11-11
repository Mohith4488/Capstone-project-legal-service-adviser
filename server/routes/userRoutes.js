import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Get single user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, name, email, phone FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching user", err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

export default router;
