import db from "../config/db.js";

// Submit feedback from user
export const submitFeedback = (req, res) => {
  const { user_id, provider_id, rating, comment } = req.body;
  if (!user_id || !provider_id || !rating)
    return res.status(400).json({ message: "user_id, provider_id, and rating are required" });

  db.query(
    "INSERT INTO feedbacks (user_id, provider_id, rating, comment) VALUES (?, ?, ?, ?)",
    [user_id, provider_id, rating, comment || ""],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error submitting feedback", err });
      res.json({ message: "Feedback submitted!", feedbackId: result.insertId });
    }
  );
};

// Get all feedback for a provider
export const getProviderFeedback = (req, res) => {
  const { provider_id } = req.params;
  db.query(
    `SELECT f.id, f.rating, f.comment, f.created_at, u.name AS user_name 
     FROM feedbacks f 
     JOIN users u ON f.user_id = u.id 
     WHERE f.provider_id = ? ORDER BY f.created_at DESC`,
    [provider_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching feedback", err });
      res.json(results);
    }
  );
};

// Get average rating for a provider
export const getProviderAvgRating = (req, res) => {
  const { provider_id } = req.params;
  db.query(
    "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews FROM feedbacks WHERE provider_id = ?",
    [provider_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching rating", err });
      res.json(results[0]);
    }
  );
};
