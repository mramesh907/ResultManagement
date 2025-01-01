import express from "express"
import { 
    checkStudentExist, getStudentByIdAndSemester, getTopStudentForSemester, importStudentsFromExcel, updateMarksForSemester 
} from "../controllers/student.contoller.js" // Import the controller
// import authenticateToken from "../middlewares/authenticateToken.js"
const router = express.Router()

// Protected routes:-
// Route for importing students from Excel file
router.post("/import", importStudentsFromExcel)


// Route for updating marks for a specific student and semester
router.put("/:studentId/semester/:semester", updateMarksForSemester)



// Unprotected routes:-
// Check if a student exists
router.get("/checkStudentExist/:studentId", checkStudentExist)
// Route for fetching student details by student ID and semester
router.get("/:studentId/semester/:semester",getStudentByIdAndSemester);
// Define the route to fetch the student with the highest marks for a given semester
router.get("/topStudentForSemester/:semester", getTopStudentForSemester);




export default router
