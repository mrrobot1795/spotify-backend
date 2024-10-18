import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
} from "../controllers/authController.js";
import { check } from "express-validator";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/register",
  [
    check("name", "Name is required").trim().notEmpty(),
    check("email", "Please include a valid email").trim().isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  registerUser
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").trim().isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginUser
);

router.get("/profile", authMiddleware, getUserProfile);
router.post("/logout", authMiddleware, logoutUser);

export default router;
