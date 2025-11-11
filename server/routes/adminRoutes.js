import express from "express";
import { getAllProviders, verifyProvider, rejectProvider } from "../controllers/adminController.js";
import db from "../config/db.js";
const router = express.Router();

// -----------------------
// Service Providers (Verify/Reject) ✅
// -----------------------
router.get("/providers", (req, res) => {
  db.query("SELECT * FROM service_providers ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching providers" });
    res.json(result);
  });
});

router.put("/providers/verify/:id", (req, res) => {
  db.query(
    "UPDATE service_providers SET is_verified=1 WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error verifying provider" });
      res.json({ message: "Provider verified successfully" });
    }
  );
});

router.put("/providers/reject/:id", (req, res) => {
  db.query(
    "UPDATE service_providers SET is_verified=0 WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error rejecting provider" });
      res.json({ message: "Provider rejected" });
    }
  );
});

// -----------------------
// Manage Users
// -----------------------
router.get("/users", (req, res) => {
  db.query("SELECT * FROM users ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(result);
  });
});

router.put("/users/block/:id", (req, res) => {
  db.query("UPDATE users SET is_blocked=1 WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Error blocking user" });
    res.json({ message: "User blocked successfully" });
  });
});

router.put("/users/unblock/:id", (req, res) => {
  db.query("UPDATE users SET is_blocked=0 WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Error unblocking user" });
    res.json({ message: "User unblocked successfully" });
  });
});


// DELETE a user
router.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Failed to delete user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
});

// DELETE /api/admin/providers/:id
router.delete("/providers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      "DELETE FROM service_providers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Provider not found" });
    }

    return res.status(200).json({ message: "Provider removed successfully" });
  } catch (err) {
    console.error("Error deleting provider:", err);
    return res.status(500).json({ message: "Failed to remove provider" });
  }
});



// -----------------------
// Manage Bookings
// -----------------------
router.get("/bookings", (req, res) => {
  const sql = `
    SELECT b.id AS booking_id, u.name AS user_name, u.email AS user_email,
           p.name AS provider_name, p.service_type, b.status, b.booking_date
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN service_providers p ON b.provider_id = p.id
    ORDER BY b.booking_date DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching bookings" });
    res.json(result);
  });
});

router.put("/bookings/status/:id", (req, res) => {
  const { status } = req.body;
  db.query("UPDATE bookings SET status=? WHERE id=?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Error updating booking status" });
    res.json({ message: `Booking status updated to ${status}` });
  });
});

// -----------------------
// View Feedback
// -----------------------
router.get("/feedbacks", (req, res) => {
  const sql = `
    SELECT f.id, u.name AS user_name, p.name AS provider_name, f.rating, f.comment, f.created_at
    FROM feedbacks f
    JOIN users u ON f.user_id = u.id
    JOIN service_providers p ON f.provider_id = p.id
    ORDER BY f.created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching feedbacks" });
    res.json(result);
  });
});

// -----------------------
// View Documents
// -----------------------
router.get("/documents", (req, res) => {
  const sql = `
    SELECT d.id, d.booking_id, d.uploaded_by, d.file_name, d.file_path, d.uploaded_at,
           u.name AS user_name, p.name AS provider_name
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by='user' AND u.id=d.booking_id
    LEFT JOIN service_providers p ON d.uploaded_by='provider' AND p.id=d.booking_id
    ORDER BY d.uploaded_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching documents" });
    res.json(result);
  });
});
export default router;
