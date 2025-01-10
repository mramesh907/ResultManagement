import Student from "../models/student.model.js"
import xlsx from "xlsx"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
// import upload from "../config/upload.js"

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to import students from an Excel file
export const importStudentsFromExcel = async (req, res) => {
  try {
    const file = req.files.file
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" })
    }
    if (!file.name.endsWith(".xlsx")) {
      return res.status(400).json({
        message: "Invalid file type. Please upload an Excel file.",
      })
    }

    // const filePath = path.join(__dirname, "..", "uploads", file.name)
    // const filePath = path.join('/tmp', file.name)
    const tempDir =
      process.env.NODE_ENV === "production"
        ? "/tmp"
        : path.join(__dirname,'..', "uploads")
    const filePath = path.join(tempDir, file.name)


    file.mv(filePath, async (err) => {
      if (err) {
        return res.status(500).json({
          message: "File upload failed",
          error: err.message,
        })
      }

      try {
        const workbook = xlsx.readFile(filePath)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = xlsx.utils.sheet_to_json(sheet, { defval: null })
        // console.log('data',data)
        if (data.length < 2) {
          fs.unlinkSync(filePath)
          return res.status(400).json({
            message:
              "The Excel file must have at least 2 rows (headers and credits)",
          })
        }
        // Extract headers from the first row
        const headers = Object.keys(data[0])
        // Extract credits from the second row
        const creditsRow = data[0] // Assume second row contains credits
        const subjectCredits = {}
        for (const key in creditsRow) {
          if (
            key !== "Student ID" &&
            key !== "Name" &&
            key !== "Roll" &&
            key !== "Reg No." &&
            key !== "Session" &&
            key !== "Year" &&
            key !== "Semester No"
          ) {
            subjectCredits[key.trim()] = creditsRow[key]
          }
        }

        // console.log("Subject to Credits Mapping:", subjectCredits)

        const students = []
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          
          // console.log("row", row)
          const {
            "Student ID": studentId,
            Name: name,
            Roll: roll,
            "Reg No.": registrationNo,
            Session: session,
            Year: year,
            "Semester No": semester,
            ...subjectMarks
          } = row

          if (
            !studentId ||
            !name ||
            !roll ||
            !registrationNo ||
            !session ||
            !year ||
            !semester
          ) {
            fs.unlinkSync(filePath)
            return res.status(400).json({
              message: "Missing mandatory fields in the Excel file",
              row,
            })
          }

          const results = []
           for (const subject in subjectMarks) {
            
             if (subject.endsWith("__EMPTY") || subjectMarks[subject] === null) {
    continue; // Skip empty or null keys
  }

             const mark = subjectMarks[subject]
             if (typeof mark === "number" && mark >= 0 && mark <= 100) {
               results.push({
                 subject: subject.trim(),
                 mark,
                 credit: subjectCredits[subject.trim()] || null, // Include credit
               })
             }
           }

          const existingStudent = await Student.findOne({ studentId })
          if (existingStudent) {
            const existingSemester = existingStudent.semesters.find(
              (sem) => String(sem.semester).trim() === String(semester).trim() // Normalize comparison
            )

            if (existingSemester) {
              results.forEach((result) => {
                const existingSubject = existingSemester.results.find(
                  (res) => res.subject === result.subject
                )
                if (existingSubject) {
                  existingSubject.mark = result.mark // Update marks
                  existingSubject.credit =
                    subjectCredits[result.subject] || null // Update credit
                } else {
                  existingSemester.results.push(result) // Add new subjects
                }
              })

              await existingStudent.save()
              // console.log(
              //   `Updated semester ${semester} for Student ID ${studentId}`
              // )
            } else {
              // Add a new semester if it doesn't exist
              existingStudent.semesters.push({ semester, results })
              await existingStudent.save()
              // console.log(
              //   `Added new semester ${semester} for Student ID ${studentId}`
              // )
            }
          } else {
            const newStudent = new Student({
              studentId,
              name,
              roll,
              registrationNo,
              session,
              year,
              semesters: [
                {
                  semester,
                  results,
                },
              ],
            })
            students.push(newStudent)
          }
        }

        if (students.length > 0) {
          await Student.insertMany(students)
        }

        fs.unlinkSync(filePath)

        res.status(200).json({
          message: "Students imported successfully",
          newStudents: students.length,
          updatedStudents: data.length - students.length,
        })
      } catch (error) {
        fs.unlinkSync(filePath)
        // console.error("Error processing Excel file:", error)
        res.status(500).json({
          message: "Error processing Excel file",
          error: error.message,
        })
      }
    })
  } catch (error) {
        fs.unlinkSync(filePath)
    // console.error("Error importing students:", error)
    res.status(500).json({
      message: "Error importing students",
      error: error.message,
    })
  }
}

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
    // console.error("Error retrieving student data:", error);
    res.status(500).json({
      message: "Error retrieving student data",
      error: error.message,
    });
  }
}

export const checkStudentExist = async (req, res) => {
  const { studentId } = req.params

  try {
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
  const { studentId, semester } = req.params
  const { results } = req.body // Assuming results will contain both marks and credits

  try {
    // Validate if marks and credits are provided in the body
    if (
      !results ||
      typeof results !== "object" ||
      Object.keys(results).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Marks and credits must be provided for subjects." })
    }

    // Find the student by studentId
    const student = await Student.findOne({ studentId })

    // If the student doesn't exist
    if (!student) {
      return res.status(404).json({ message: "Student not found." })
    }

    // Find the semester in the student's semesters array
    let semesterIndex = student.semesters.findIndex(
      (sem) => sem.semester === semester
    )

    // If the semester doesn't exist
    if (semesterIndex === -1) {
      student.semesters.push({
        semester: semester,
        results: [], // New semester with empty results
      })
      semesterIndex = student.semesters.length - 1 
    }

    // Get the semester object
    const studentSemester = student.semesters[semesterIndex]

    // Update the marks and credits for each subject
    Object.keys(results).forEach((subject) => {
      const { mark, credit } = results[subject] // Destructure mark and credit
      const subjectIndex = studentSemester.results.findIndex(
        (result) => result.subject === subject
      )

      // If the subject already exists, update its mark and credit
      if (subjectIndex !== -1) {
        studentSemester.results[subjectIndex].mark = mark
        studentSemester.results[subjectIndex].credit = credit
      } else {
        // If subject doesn't exist, add it to the results with mark and credit
        studentSemester.results.push({ subject, mark, credit })
      }
    })

    // Save the updated student record
    await student.save()

    res.status(200).json({
      message: "Marks and credits updated successfully",
      updatedStudent: student.semesters.find(
        (sem) => sem.semester === semester
      ),
    })
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error updating marks and credits",
        error: error.message,
      })
  }
}


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
    // console.error("Error fetching top student for semester:", error)
    res.status(500).json({
      message: "Error fetching top student for semester",
      error: error.message,
    })
  }
}


// Get top rankers
export const getTopRankers = async (req, res) => {
  try {
    // Fetch all students
    const students = await Student.find()

    if (students.length === 0) {
      return res.status(404).json({
        message: "No students found",
      })
    }

    // Create an array to store total marks for each student
    const studentRanks = students.map((student) => {
      // Calculate total marks across all semesters
      const totalMarks = student.semesters.reduce((total, semester) => {
        return (
          total + semester.results.reduce((sum, result) => sum + result.mark, 0)
        )
      }, 0)

      return {
        studentId: student.studentId,
        name: student.name,
        totalMarks,
      }
    })

    // Sort students by totalMarks in descending order
    studentRanks.sort((a, b) => b.totalMarks - a.totalMarks)

    // Get the top 5 rankers
    const topRankers = studentRanks.slice(0, 5)

    res.status(200).json({
      message: "Top 5 rankers across all semesters",
      rankers: topRankers,
    })
  } catch (error) {
    // console.error("Error fetching top rankers:", error);
    res.status(500).json({
      message: "Error fetching top rankers",
      error: error.message,
    })
  }
}

// Calculate CGPA
export const calculateCGPA = async (req, res) => {
  const { studentId, semester } = req.params

  try {
    // Fetch the student record
    const student = await Student.findOne({ studentId })

    if (!student) {
      return res.status(404).json({
        message: `Student with ID ${studentId} not found`,
      })
    }

    // Find semester details for the given semester
    const semesterDetails = student.semesters.find(
      (sem) => sem.semester === semester
    )

    if (!semesterDetails) {
      return res.status(404).json({
        message: `Semester ${semester} not found for student ${studentId}`,
      })
    }

    // Helper function to determine grade point based on marks
    const getGradePoint = (marks) => {
      if (marks >= 90) return 10 // O
      if (marks >= 80) return 9 // A+
      if (marks >= 70) return 8 // A
      if (marks >= 60) return 7 // B+
      if (marks >= 50) return 6 // B
      if (marks >= 40) return 5 // C
      if (marks >= 30) return 4 // P
      return 0 // F (Fail) or AB (Absent)
    }

    // Calculate total grade points and total credits
    let totalGradePoints = 0
    let totalCredits = 0

    semesterDetails.results.forEach((result) => {
      const { mark, credit = 1 } = result // Default credit to 1 if missing
      const gradePoint = getGradePoint(mark) // Get grade point based on mark
      totalGradePoints += gradePoint * credit
      totalCredits += credit
    })

    // Calculate CGPA for the semester
    const cgpa =
      totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0

    res.status(200).json({
      message: `CGPA calculated for student ${studentId} in semester ${semester}`,
      studentId: student.studentId,
      name: student.name,
      semester,
      cgpa,
    })
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      message: "Error calculating CGPA",
      error: error.message,
    })
  }
}
