import express from "express"
import {
  addNewStudent,
  importStudentsFromExcel,
  updateMarksForSemester,
  checkStudentExist,
  getStudentByIdAndSemester,
  getTopStudentForSemester,
  getTopRankers,
  calculateCGPA,
  calculateSGPA,
  calculateCGPASGPA,
  calculateGPA,
  getComparisonStudent,
  studentCount,
  semesterPerformance,
} from "../controllers/student.contoller.js" // Import the controller

const router = express.Router()

// Public routes (unprotected)
router.get("/checkStudentExist/:studentId", checkStudentExist) // Check if a student exists
router.get("/:studentId/semester/:semester", getStudentByIdAndSemester) // Fetch student details by student ID and semester
router.get("/topStudentForSemester/:semester", getTopStudentForSemester) // Get top student for a specific semester
router.get("/top-rankers", getTopRankers) // Fetch top rankers
router.get("/calculate-cgpa/:studentId", calculateCGPA) // Calculate CGPA for a student in a specific semester
router.get("/calculate-sgpa/:studentId", calculateSGPA) // Calculate SGPA for a student in a specific semester
router.get("/calculate-cgpa-sgpa/:studentId", calculateCGPASGPA) // Calculate SGPA for a student in a specific semester
router.get("/calculate-gpa/:studentId", calculateGPA) // Calculate SGPA for a student in a specific semester
router.get("/compareResults/:studentId1/:studentId2/semester/:semester", getComparisonStudent)
router.get("/admin/semester-wise-count", studentCount)
router.get("/admin/semester-wise-performance", semesterPerformance)


// Protected routes (requires authentication or authorization)
router.post("/add-student", addNewStudent) // Add a new student
router.post("/import", importStudentsFromExcel) // Import students from an Excel file
router.post("/update-marks", updateMarksForSemester) // Update marks for a student in a specific semester

export default router
