import express from "express";
import {
  createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  getVerifiedProviders
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create", createBooking);
router.get("/user/:id", getUserBookings);
router.get("/provider/:id", getProviderBookings);
router.put("/status/:id", updateBookingStatus); // body: { status: 'accepted'|'rejected' }
router.get("/verified-providers", getVerifiedProviders);

export default router;
