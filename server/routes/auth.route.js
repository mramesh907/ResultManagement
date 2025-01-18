import express from "express"
import {
  changePassword,
  checkEmailExists,
  signin,
  signup,
} from "../controllers/auth.controller.js"

const router = express.Router()

// Sign-in route
router.post("/signin", signin)
router.post("/signup", signup)
router.post("/check-email", checkEmailExists)
router.post("/change-password", changePassword)

export default router
