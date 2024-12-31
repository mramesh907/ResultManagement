import express from "express"
import { 
    checkStudentExist, getStudentByIdAndSemester, importStudentsFromExcel, updateMarksForSemester 
} from "../controllers/student.contoller.js" // Import the controller
// import authenticateToken from "../middlewares/authenticateToken.js"
const router = express.Router()

// Protected routes:-
// Route for importing students from Excel file
router.post("/import", importStudentsFromExcel)

// Route for fetching student details by student ID and semester
router.get("/:studentId/semester/:semester",getStudentByIdAndSemester);


// Unprotected routes:-
// Check if a student exists
router.get("/checkStudentExist/:studentId", checkStudentExist)

// Route for updating marks for a specific student and semester
router.put("/:studentId/semester/:semester", updateMarksForSemester)


export default router
