import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  registerProvider,
  loginProvider,
  loginAdmin,
} from "../controllers/authController.js";

const router = express.Router();

// Multer setup for provider document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/providers/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Routes
router.post("/register-user", registerUser);
router.post("/login-user", loginUser);

router.post(
  "/register-provider",
  upload.fields([
    { name: "bar_certificate", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
    { name: "qualification_cert", maxCount: 1 },
  ]),
  registerProvider
);

router.post("/login-provider", loginProvider);
router.post("/login-admin", loginAdmin);

export default router;
