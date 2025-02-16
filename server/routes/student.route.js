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
  getStudentsBySemester,
  submitMarks,
  authenticateStudent,
  createStudentPassword,
  resetStudentPassword,
  verifyStudent,
  addStudentWithDynamicSemester,
  upgradeSemester,
  uploadStudentsFromExcel,
} from "../controllers/student.contoller.js" // Import the controller

const router = express.Router()

// ----------------------
// Student Authentication Routes (Public)
// ----------------------
router.post("/create-password", createStudentPassword);
router.post("/authenticate-student", authenticateStudent);
router.post("/verify-student", verifyStudent);
router.post("/reset-password", resetStudentPassword);

// ----------------------
// Student Management Routes (Public)
// ----------------------
router.post("/add-student-dynamic", addStudentWithDynamicSemester); // Add a new student
router.post("/upgrade-semester", upgradeSemester);
router.get("/checkStudentExist/:studentId", checkStudentExist); // Check if a student exists
router.get("/:studentId/semester/:semester", getStudentByIdAndSemester); // Fetch student details by ID & semester
router.get("/allstudents/:semester", getStudentsBySemester);

// ----------------------
// Academic Performance Routes (Public)
// ----------------------
router.post("/submitMarks", submitMarks);
router.get("/topStudentForSemester/:semester", getTopStudentForSemester); // Get top student for a semester
router.get("/top-rankers", getTopRankers); // Fetch top rankers
router.get("/calculate-cgpa/:studentId", calculateCGPA); // Calculate CGPA for a student
router.get("/calculate-sgpa/:studentId", calculateSGPA); // Calculate SGPA for a student
router.get("/calculate-cgpa-sgpa/:studentId", calculateCGPASGPA); // Calculate both CGPA & SGPA
router.get("/calculate-gpa/:studentId", calculateGPA); // Calculate GPA for a student
router.get(
  "/compareResults/:studentId1/:studentId2/semester/:semester",
  getComparisonStudent
);

// ----------------------
// Admin & Analytics Routes (Protected)
// ----------------------
router.get("/admin/semester-wise-count", studentCount);
router.get("/admin/semester-wise-performance", semesterPerformance);

// ----------------------
// Protected Routes (Requires Authentication)
// ----------------------
router.post("/add-student", addNewStudent); // Add a new student
router.post("/import", importStudentsFromExcel); // Import students from an Excel file
router.post("/update-marks", updateMarksForSemester); // Update marks for a semester
router.post("/upload-student-excel", uploadStudentsFromExcel);


export default router
