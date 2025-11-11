import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/:bookingId", (req, res) => {
  const { bookingId } = req.params;

  db.query(
    "SELECT sender, message, timestamp AS time FROM chats WHERE booking_id = ? ORDER BY timestamp ASC",
    [bookingId],
    (err, results) => {
      if (err)
        return res.status(500).json({ message: "Error fetching chats", err });

      res.json(results);
    }
  );
});

export default router;
