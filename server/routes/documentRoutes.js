import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/db.js"; // Callback-based connection

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "uploads/documents";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 📥 Upload Document (User or Provider)
router.post("/upload", upload.single("file"), (req, res) => {
  const { booking_id, uploaded_by } = req.body;

  if (!booking_id || !uploaded_by || !req.file) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const file_path = req.file.path.replace(/\\/g, "/");

  const query = `
    INSERT INTO documents 
    (booking_id, uploaded_by, file_name, file_path, uploaded_at) 
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [booking_id, uploaded_by, req.file.originalname, file_path], (err, result) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Error uploading file" });
    }
    res.json({ message: "File uploaded successfully" });
  });
});

// 📤 Get all documents for a booking
router.get("/:booking_id", (req, res) => {
  const { booking_id } = req.params;

  const query = `
    SELECT * FROM documents 
    WHERE booking_id = ? 
    ORDER BY uploaded_at DESC
  `;

  db.query(query, [booking_id], (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ message: "Error fetching documents" });
    }
    res.json(results);
  });
});

export default router;
