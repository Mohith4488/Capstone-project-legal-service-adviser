import db from "../config/db.js";
import path from "path";
import fs from "fs";

// Upload a document
export const uploadDocument = (req, res) => {
  const { booking_id, uploaded_by } = req.body;
  if (!booking_id || !uploaded_by || !req.file)
    return res.status(400).json({ message: "booking_id, uploaded_by, and file are required" });

  const file_name = req.file.originalname;
  const file_url = `/uploads/${req.file.filename}`;

  db.query(
    "INSERT INTO documents (booking_id, uploaded_by, file_name, file_url) VALUES (?, ?, ?, ?)",
    [booking_id, uploaded_by, file_name, file_url],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error uploading document", err });
      res.json({ message: "Document uploaded successfully", documentId: result.insertId });
    }
  );
};

// Get documents for a booking
export const getDocumentsByBooking = (req, res) => {
  const { booking_id } = req.params;
  db.query(
    "SELECT * FROM documents WHERE booking_id = ? ORDER BY created_at DESC",
    [booking_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching documents", err });
      res.json(results);
    }
  );
};
