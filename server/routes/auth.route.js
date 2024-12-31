import express from "express"
import { signin } from "../controllers/auth.controller.js"

const router = express.Router()

// Sign-in route
router.post("/signin", signin)

export default router
