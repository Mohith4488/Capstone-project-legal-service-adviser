import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ---------------- USER REGISTER ----------------
export const registerUser = (req, res) => {
  const { name, email, password, phone } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, phone],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Error registering user", err });

      res.json({ message: "User registered successfully!" });
    }
  );
};

// ---------------- USER LOGIN ----------------
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: "user" }, "secretkey");

    // ✅ Send the user ID also
    res.json({
      token,
      role: "user",
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      message: "Login successful!",
    });
  });
};

// ---------------- SERVICE PROVIDER REGISTER ----------------
export const registerProvider = (req, res) => {
  const { name, email, password, phone, service_type } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const bar_certificate = req.files["bar_certificate"]
    ? req.files["bar_certificate"][0].path
    : null;
  const id_proof = req.files["id_proof"]
    ? req.files["id_proof"][0].path
    : null;
  const qualification_cert = req.files["qualification_cert"]
    ? req.files["qualification_cert"][0].path
    : null;

  db.query(
    `INSERT INTO service_providers 
      (name, email, password, phone, service_type, bar_certificate, id_proof, qualification_cert) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      hashedPassword,
      phone,
      service_type,
      bar_certificate,
      id_proof,
      qualification_cert,
    ],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error registering provider", err });

      res.json({
        message:
          "Provider registered successfully! Please wait for admin verification.",
      });
    }
  );
};

// ---------------- SERVICE PROVIDER LOGIN ----------------
export const loginProvider = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM service_providers WHERE email = ?",
    [email],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const provider = results[0];

      if (!provider.is_verified)
        return res.status(403).json({ message: "Not verified by admin yet." });

      const isMatch = bcrypt.compareSync(password, provider.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: provider.id, role: "provider" }, "secretkey");

      res.json({
        token,
        role: "provider",
        id: provider.id, // ✅ send provider id
        name: provider.name,
        email: provider.email,
        service_type: provider.service_type,
        phone: provider.phone,
        message: "Login successful!",
      });
    }
  );
};

// ---------------- ADMIN LOGIN ----------------
export const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const admin = results[0];

    if (password !== admin.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, "secretkey");

    res.json({
      token,
      role: "admin",
      id: admin.id, // ✅ add this
      message: "Login successful!",
    });
  });
};
