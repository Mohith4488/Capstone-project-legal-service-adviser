import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Submit feedback
router.post("/", (req, res) => {
  const { user_id, provider_id, rating, comment } = req.body;

  if (!user_id || !provider_id || !rating) {
    return res.status(400).json({ message: "User ID, provider ID and rating are required" });
  }

  const sql = `
    INSERT INTO feedbacks (user_id, provider_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [user_id, provider_id, rating, comment || ""], (err, result) => {
    if (err) {
      console.error("Feedback insert error:", err);
      return res.status(500).json({ message: "Error submitting feedback" });
    }
    res.json({ message: "Feedback submitted successfully" });
  });
});

// Get all bookings for a user along with provider info and feedback
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      sp.id AS provider_id,
      sp.name AS provider_name,
      sp.service_type,
      IFNULL(AVG(f.rating), 0) AS avg_rating,
      MAX(f.rating) AS your_rating,
      MAX(f.comment) AS your_comment
    FROM bookings b
    JOIN service_providers sp ON b.provider_id = sp.id
    LEFT JOIN feedbacks f 
      ON f.user_id = b.user_id AND f.provider_id = b.provider_id
    WHERE b.user_id = ?
    GROUP BY sp.id, sp.name, sp.service_type
    ORDER BY sp.name
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fetch providers error:", err);
      return res.status(500).json({ message: "Error fetching providers" });
    }
    res.json(results); 
  });
});


export default router;
