import Student from "../models/student.model.js"
import xlsx from "xlsx"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
// import upload from "../config/upload.js"

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
        const data = xlsx.utils.sheet_to_json(sheet)

        if (data.length === 0) {
          return res.status(400).json({ message: "The Excel file is empty" })
        }

        const students = []
        for (let row of data) {
          const {
            "Student ID": studentId,
            Name: name,
            Roll: roll,
            "Reg No.": registrationNo,
            Session: session,
            Year: year,
            "Semester No": semester,
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
          for (let key in row) {
            if (
              key !== "Student ID" &&
              key !== "Name" &&
              key !== "Roll" &&
              key !== "Reg No." &&
              key !== "Session" &&
              key !== "Year" &&
              key !== "Semester No"
            ) {
              const mark = row[key]
              if (typeof mark !== "number" || mark < 0 || mark > 100) {
                return res.status(400).json({
                  message: `Invalid mark (${mark}) for subject ${key} in row`,
                  row,
                })
              }
              results.push({ subject: key.trim(), mark }) // Normalize subject names
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
        console.error("Error processing Excel file:", error)
        res.status(500).json({
          message: "Error processing Excel file",
          error: error.message,
        })
      }
    })
  } catch (error) {
        fs.unlinkSync(filePath)
    console.error("Error importing students:", error)
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


