import db from "../config/db.js";

// Get all service providers
export const getAllProviders = (req, res) => {
  db.query("SELECT * FROM service_providers", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching providers", err });
    res.json(results);
  });
};

// Verify a provider
export const verifyProvider = (req, res) => {
  const { id } = req.params;
  db.query("UPDATE service_providers SET is_verified = TRUE WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Error verifying provider", err });
    res.json({ message: "Provider verified successfully!" });
  });
};

// Reject a provider
export const rejectProvider = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM service_providers WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Error rejecting provider", err });
    res.json({ message: "Provider rejected and removed!" });
  });
};
