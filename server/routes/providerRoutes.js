import express from "express";
import { getProviderById } from "../controllers/providerController.js";

const router = express.Router();

// Specific route must come first
router.get("/feedbacks/provider/:providerId", (req, res) => {
  const providerId = req.params.providerId;
  const sql = `
    SELECT f.id, u.name AS user_name, f.rating, f.comment, f.created_at
    FROM feedbacks f
    JOIN users u ON f.user_id = u.id
    WHERE f.provider_id = ?
    ORDER BY f.created_at DESC
  `;
  db.query(sql, [providerId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching feedbacks" });
    res.json(result);
  });
});

// Generic route
router.get("/:id", getProviderById);

export default router;
