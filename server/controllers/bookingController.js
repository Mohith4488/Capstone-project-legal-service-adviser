import db from "../config/db.js";

// Get all verified providers
export const getVerifiedProviders = (req, res) => {
  db.query("SELECT id, name, email, service_type FROM service_providers WHERE is_verified = TRUE", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching providers", err });
    res.json(results);
  });
};

// Create a booking
export const createBooking = (req, res) => {
  const { user_id, provider_id } = req.body;
  if (!user_id || !provider_id) return res.status(400).json({ message: "user_id and provider_id required" });

  db.query("INSERT INTO bookings (user_id, provider_id) VALUES (?, ?)", [user_id, provider_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error creating booking", err });
    res.json({ message: "Booking request sent!", bookingId: result.insertId });
  });
};

// Get all bookings of a user
export const getUserBookings = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT b.*, s.name AS provider_name, s.service_type 
     FROM bookings b 
     JOIN service_providers s ON b.provider_id = s.id 
     WHERE b.user_id = ? ORDER BY b.booking_date DESC`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching bookings", err });
      res.json(results);
    }
  );
};

// Get bookings received by provider
export const getProviderBookings = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT b.*, u.name AS user_name, u.email AS user_email 
     FROM bookings b 
     JOIN users u ON b.user_id = u.id 
     WHERE b.provider_id = ? ORDER BY b.booking_date DESC`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching provider bookings", err });
      res.json(results);
    }
  );
};

// Update booking status
export const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending','accepted','rejected'].includes(status)) return res.status(400).json({ message: "Invalid status" });

  db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ message: "Error updating status", err });
    res.json({ message: "Booking status updated!" });
  });
};
