import Student from "../models/student.model.js"
import xlsx from "xlsx"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import upload from "../config/upload.js"

// Get the current directory path
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// Your route handler for uploading and processing the Excel file
export const importStudentsFromExcel = async (req, res) => {
  try {
    // Handle file upload using multer
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }

      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!file.originalname.endsWith(".xlsx")) {
        return res.status(400).json({ message: "Please upload an Excel file (.xlsx)" });
      }

      try {
        // Read the uploaded file buffer using xlsx library
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });

        // Extract the first sheet
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet); // Convert sheet to JSON

        if (data.length === 0) {
          return res.status(400).json({ message: "The Excel file is empty" });
        }

        // Process the student data as required (you can insert into DB, etc.)
        // This is where you process your data
        res.status(200).json({ message: "File processed successfully", data });
      } catch (error) {
        res.status(500).json({ message: "Error processing Excel file", error: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing students", error: error.message });
  }
};


// Get student details by student ID and semester number
export const getStudentByIdAndSemester = async (req, res) => {
  const { studentId, semester } = req.params; // Extract studentId and semester from the request parameters

  try {
    // Find student by studentId and filter for the specific semester
    const student = await Student.findOne({
      studentId,
      "semesters.semester": semester, // Check if the semester exists in the student's semesters array
    });

    if (!student) {
      return res.status(404).json({
        message: `Student with ID ${studentId} not found or semester ${semester} not found`,
      });
    }

    // Find the semester details inside the student's semesters array
    const semesterDetails = student.semesters.find(
      (sem) => sem.semester === semester
    );

    res.status(200).json({
      studentId: student.studentId,
      name: student.name,
      roll: student.roll,
      registrationNo: student.registrationNo,
      session: student.session,
      year: student.year,
      semester: semesterDetails,
    });
  } catch (error) {
    console.error("Error retrieving student data:", error);
    res.status(500).json({
      message: "Error retrieving student data",
      error: error.message,
    });
  }
};

export const checkStudentExist = async (req, res) => {
  const { studentId } = req.params

  try {
    console.log("Received studentId:", studentId)
    // Query the database to check if the student exists
    const student = await Student.findOne({ studentId })

    if (student) {
      return res.status(200).json({ exists: true })
    } else {
      return res
        .status(404)
        .json({ exists: false, message: "Student not found" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

// Function to update marks for a specific student and semester
export const updateMarksForSemester = async (req, res) => {
  const { studentId, semester } = req.params;
  const { marks } = req.body.results; // The marks will be passed in the body

  try {
    // Validate if marks are provided in the body
    if (!marks || typeof marks !== "object" || Object.keys(marks).length === 0) {
      return res.status(400).json({ message: "Marks must be provided for subjects." });
    }

    // Find the student by studentId
    const student = await Student.findOne({ studentId });

    // If the student doesn't exist
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Find the semester in the student's semesters array
    const semesterIndex = student.semesters.findIndex((sem) => sem.semester === semester);

    // If the semester doesn't exist
    if (semesterIndex === -1) {
      return res.status(404).json({ message: `Semester ${semester} not found for student ${studentId}` });
    }

    // Get the semester object
    const studentSemester = student.semesters[semesterIndex];

    // Update the marks for each subject
    Object.keys(marks).forEach((subject) => {
      const subjectIndex = studentSemester.results.findIndex((result) => result.subject === subject);
      
      // If the subject already exists, update its mark
      if (subjectIndex !== -1) {
        studentSemester.results[subjectIndex].mark = marks[subject];
      } else {
        // If subject doesn't exist, add it to the results
        studentSemester.results.push({ subject, mark: marks[subject] });
      }
    });

    // Save the updated student record
    await student.save();

    res.status(200).json({
      message: "Marks updated successfully",
      updatedStudent: student.semesters.find(
        (sem) => sem.semester === semester
      ),
    })
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ message: "Error updating marks", error: error.message });
  }
};

// Get top student for a specific semester
export const getTopStudentForSemester = async (req, res) => {
  const { semester } = req.params // Extract semester from request parameters

  try {
    // Find all students who have results for the specific semester
    const students = await Student.find({
      "semesters.semester": semester, // Check if the semester exists in any student's semesters (treating semester as a string)
    })

    if (students.length === 0) {
      return res.status(404).json({
        message: `No results found for semester ${semester}`,
      })
    }

    let topStudent = null
    let highestMarks = -1

    // Iterate over each student and calculate their total marks for the given semester
    for (const student of students) {
      const semesterDetails = student.semesters.find(
        (sem) => sem.semester === semester // Match semester as a string
      )

      // If no semester details are found, skip this student
      if (!semesterDetails) {
        continue // Skip this student
      }

      // Sum the marks for each subject in the semester
      const totalMarks = semesterDetails.results.reduce(
        (sum, result) => sum + result.mark,
        0
      )

      // Update topStudent if current student's total marks are higher
      if (totalMarks > highestMarks) {
        highestMarks = totalMarks
        topStudent = student
      }
    }

    if (topStudent) {
      res.status(200).json({
        message: `Top student for semester ${semester}`,
        studentId: topStudent.studentId,
        name: topStudent.name,
        totalMarks: highestMarks,
        semester: topStudent.semesters.find(
          (sem) => sem.semester === semester // Match semester as a string
        ),
      })
    } else {
      res.status(404).json({
        message: "No student has marks for this semester.",
      })
    }
  } catch (error) {
    console.error("Error fetching top student for semester:", error)
    res.status(500).json({
      message: "Error fetching top student for semester",
      error: error.message,
    })
  }
}


