import express from "express";
import { addScholarship, getScholarships, getEligibleScholarships } from "../controllers/scholarship.controller.js";

const router = express.Router();

// Route to add a scholarship
router.post('/scholarships', addScholarship);

// Route to get all scholarships
router.get('/scholarships', getScholarships);

// Route to get eligible scholarships based on CGPA and family income
router.get('/eligible-scholarships', getEligibleScholarships);

export default router;