import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Path to documents folder
const documentsDir = path.join(process.cwd(), "uploads/documents");

// Get all documents in folder
router.get("/", (req, res) => {
  fs.readdir(documentsDir, (err, files) => {
    if (err) {
      console.error("Error reading documents folder:", err);
      return res.status(500).json({ message: "Error reading documents" });
    }

    // Map files to object with filename and link
    const docs = files.map(file => ({
      file_name: file,
      file_path: `/uploads/documents/${file}` // accessible via express static
    }));

    res.json(docs);
  });
});

export default router;
