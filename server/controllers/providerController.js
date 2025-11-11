import db from "../config/db.js";

// Get provider by ID
export const getProviderById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT id, name, email, service_type FROM service_providers WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching provider", err });
      if (results.length === 0) return res.status(404).json({ message: "Provider not found" });
      res.json(results[0]);
    }
  );
};
