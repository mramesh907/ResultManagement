import Student from "../models/student.model.js"
import xlsx from "xlsx"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
// import upload from "../config/upload.js"

// Get the current directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Add a new student
export const addNewStudent = async (req, res) => {
  try {
    const { studentId, name, roll, registrationNo, session, year, semesters } =
      req.body

    // Validate required fields
    if (!studentId || !name || !roll || !registrationNo || !session || !year) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." })
    }

    // Check if the student already exists
    const existingStudent = await Student.findOne({ studentId })
    if (existingStudent) {
      return res
        .status(400)
        .json({ error: "Student with this ID already exists." })
    }

    // Create a new student document
    const newStudent = new Student({
      studentId,
      name,
      roll,
      registrationNo,
      session,
      year,
      semesters: semesters || [], // Optionally add semesters
    })

    // Save the student to the database
    await newStudent.save()

    res.status(201).json({
      message: "New student added successfully.",
      student: newStudent,
    })
  } catch (error) {
    console.error("Error adding new student:", error)
    res
      .status(500)
      .json({ error: "An error occurred while adding the student." })
  }
}

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
        : path.join(__dirname, "..", "uploads")
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
              continue // Skip empty or null keys
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

// Function to update marks for a specific student and semester
export const updateMarksForSemester = async (req, res) => {
  try {
    const {
      semester,
      subject,
      course,
      paper,
      type,
      ciaMarks,
      eseMarks,
      credit,
      students,
    } = req.body

    if (
      !semester ||
      !subject ||
      !credit ||
      !course ||
      !paper ||
      !type ||
      !ciaMarks ||
      !eseMarks ||
      !credit === undefined
    ) {
      return res
        .status(400)
        .json({ error: "All subject details are required." })
    }
    // Ensure obtained marks are never greater than maximum marks
    if (ciaMarks < 0 || eseMarks < 0 || credit < 0) {
      return res.status(400).json({
        error: "CIA Marks, ESE Marks, and Credit cannot be negative.",
      })
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one student is required." })
    }
    const notFoundStudents = []
    // Process each student
    for (const student of students) {
      const { studentId, ciamarksObtained, esemarksObtained } = student

      if (
        !studentId ||
        ciamarksObtained === undefined ||
        esemarksObtained === undefined
      ) {
        return res.status(400).json({ error: "Student data is incomplete." })
      }
 // Ensure obtained marks are not greater than maximum marks
      if (
        ciamarksObtained > ciaMarks ||
        esemarksObtained > eseMarks ||
        ciamarksObtained < 0 ||
        esemarksObtained < 0
      ) {
        return res.status(400).json({
          error: `Invalid marks for studentId: ${studentId}. 
                  Obtained marks cannot be greater than the maximum marks or less than 0.`,
        });
      }
      const studentRecord = await Student.findOne({ studentId })
      if (!studentRecord) {
        notFoundStudents.push(studentId)
        continue // Skip if student is not found
      }

      // Find or create the semester record
      let semesterRecord = studentRecord.semesters.find(
        (s) => s.semester === semester
      )
      if (!semesterRecord) {
        semesterRecord = {
          semester,
          results: [
            {
              subject,
              course,
              paper,
              types: [
                {
                  type,
                  credit,
                  ciaMarks,
                  eseMarks,
                  ciamarksObtained,
                  esemarksObtained,
                },
              ],
            },
          ],
        }
        studentRecord.semesters.push(semesterRecord) // Add new semester if not found
      }

      // Find the subject record
      let subjectRecord = semesterRecord.results.find(
        (r) => r.subject === subject && r.course === course && r.paper === paper
      )

      // If subject doesn't exist, create it with the types array initialized directly
      if (!subjectRecord) {
        subjectRecord = {
          subject,
          course,
          paper,
          types: [
            {
              type,
              credit,
              ciaMarks,
              eseMarks,
              ciamarksObtained,
              esemarksObtained,
            },
          ],
        }
        semesterRecord.results.push(subjectRecord)
      } else {
        // If the subject exists, find or create the type record
        if (!subjectRecord.types) {
          subjectRecord.types = []
        }

        let typeRecord = subjectRecord.types.find((t) => t.type === type)
        if (!typeRecord) {
          // Add a new type if it doesn't exist
          typeRecord = {
            type,
            credit,
            ciaMarks,
            eseMarks,
            ciamarksObtained,
            esemarksObtained,
          }
          subjectRecord.types.push(typeRecord)
        } else {
          // Update existing type record
          typeRecord.credit = credit // Update the credit if already exists
          typeRecord.ciaMarks = ciaMarks
          typeRecord.eseMarks = eseMarks
          typeRecord.ciamarksObtained = ciamarksObtained
          typeRecord.esemarksObtained = esemarksObtained
        }
      }

      // Save the updated student record
      await studentRecord.save()
    }

    res.status(200).json({ message: "Marks updated for all students." })
  } catch (error) {
    console.error("Error in batch update:", error)
    res.status(500).json({ error: "An error occurred while updating marks." })
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

    // Get the detailed marks for each subject in the semester
    const subjectsDetails = semesterDetails.results.map((result) => ({
      subject: result.subject,
      course: result.course,
      paper: result.paper,
      types: result.types.map((type) => ({
        type: type.type,
        credit: type.credit,
        ciaMarks: type.ciaMarks,
        eseMarks: type.eseMarks,
        ciamarksObtained: type.ciamarksObtained,
        esemarksObtained: type.esemarksObtained,
      })),
    }));

    res.status(200).json({
      studentId: student.studentId,
      name: student.name,
      roll: student.roll,
      registrationNo: student.registrationNo,
      session: student.session,
      year: student.year,
      semester: {
        semester: semesterDetails.semester,
        results: subjectsDetails,
      },
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      message: "Error retrieving student data",
      error: error.message,
    });
  }
};


// Check if student exists
export const checkStudentExist = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Query the database to check if the student exists by studentId
    const student = await Student.findOne({ studentId });

    if (student) {
      // If student exists, return response with success
      return res.status(200).json({
        exists: true,
        studentId: student.studentId,
        name: student.name,
        message: `Student ${student.name} found`
      });
    } else {
      // If student does not exist, return response with error message
      return res.status(404).json({
        exists: false,
        message: `Student with ID ${studentId} not found`
      });
    }
  } catch (error) {
    // Handle any server errors
    console.error("Error in checking student existence:", error);
    return res.status(500).json({
      message: "Server error while checking student existence",
      error: error.message,
    });
  }
};


// Get top student for a specific semester
export const getTopStudentForSemester = async (req, res) => {
  const { semester } = req.params; // Extract semester from request parameters

  try {
    // Find all students who have results for the specific semester
    const students = await Student.find({
      "semesters.semester": semester, // Check if the semester exists in any student's semesters (treating semester as a string)
    });

    if (students.length === 0) {
      return res.status(404).json({
        message: `No results found for semester ${semester}`,
      });
    }

    let topStudent = null;
    let highestMarks = -1;

    // Iterate over each student and calculate their total marks for the given semester
    for (const student of students) {
      const semesterDetails = student.semesters.find(
        (sem) => sem.semester === semester // Match semester as a string
      );

      // If no semester details are found, skip this student
      if (!semesterDetails) {
        continue; // Skip this student
      }

      // Sum the marks for each subject in the semester
      const totalMarks = semesterDetails.results.reduce(
        (sum, result) => {
          // For each result, sum the CIA and ESE marks from all paper types
          const marksForSubject = result.types.reduce(
            (subSum, type) => subSum + type.ciaMarks + type.eseMarks,
            0
          );
          return sum + marksForSubject;
        },
        0
      );

      // Update topStudent if current student's total marks are higher
      if (totalMarks > highestMarks) {
        highestMarks = totalMarks;
        topStudent = student;
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
      });
    } else {
      res.status(404).json({
        message: "No student has marks for this semester.",
      });
    }
  } catch (error) {
    // console.error("Error fetching top student for semester:", error)
    res.status(500).json({
      message: "Error fetching top student for semester",
      error: error.message,
    });
  }
};


// Get top rankers
export const getTopRankers = async (req, res) => {
  try {
    // Fetch all students
    const students = await Student.find();

    if (students.length === 0) {
      return res.status(404).json({
        message: "No students found",
      });
    }

    // Create an array to store total marks for each student, based on their highest semester marks
    const studentRanks = students.map((student) => {
      // Get the highest marks obtained in any semester
      const highestMarks = student.semesters.reduce((highest, semester) => {
        const semesterMarks = semester.results.reduce((sum, result) => {
          // Add marks from each paper type (CIA + ESE)
          return (
            sum +
            result.types.reduce(
              (subSum, type) => subSum + type.ciaMarks + type.eseMarks,
              0
            )
          );
        }, 0);

        // Compare and get the maximum total marks for the semester
        return Math.max(highest, semesterMarks);
      }, 0);

      return {
        studentId: student.studentId,
        name: student.name,
        highestMarks, // Store the highest marks from any semester
      };
    });

    // Sort students by highestMarks in descending order
    studentRanks.sort((a, b) => b.highestMarks - a.highestMarks);

    // Get the top 5 rankers
    const topRankers = studentRanks.slice(0, 5);

    res.status(200).json({
      message: "Top 5 rankers based on highest marks in any semester",
      rankers: topRankers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching top rankers",
      error: error.message,
    });
  }
};




// Calculate CGPA
// Calculate CGPA across all semesters
// Calculate CGPA across all semesters
export const calculateCGPA = async (req, res) => {
  const { studentId } = req.params

  try {
    // Fetch the student record
    const student = await Student.findOne({ studentId })

    if (!student) {
      return res.status(404).json({
        message: `Student with ID ${studentId} not found`,
      })
    }

    // Ensure the student has semester data
    if (!student.semesters || student.semesters.length === 0) {
      return res.status(404).json({
        message: `No semester data found for student ${studentId}`,
      })
    }

    let totalWeightedGradePoints = 0 // ∑(Grade Points × Credits)
    let totalCredits = 0 // Total credits across all semesters

    // Grade calculation function
    const calculateGradePoints = (percentage) => {
      if (percentage >= 90) return 10 // "O"
      if (percentage >= 80) return 9 // "A+"
      if (percentage >= 70) return 8 // "A"
      if (percentage >= 60) return 7 // "B+"
      if (percentage >= 50) return 6 // "B"
      if (percentage >= 40) return 5 // "C"
      if (percentage >= 30) return 4 // "P"
      return 0 // "F"
    }

    // Iterate through each semester
    student.semesters.forEach((semester) => {
      let semesterWeightedGradePoints = 0 // ∑(Grade Points × Credits)
      let semesterCredits = 0 // Total credits for the semester

      // Iterate through each subject
      semester.results.forEach((subject) => {
        subject.types.forEach((type) => {
          const {
            credit,
            ciamarksObtained,
            esemarksObtained,
            ciaMarks,
            eseMarks,
          } = type

          if (
            credit &&
            ciamarksObtained !== undefined &&
            esemarksObtained !== undefined
          ) {
            const totalMarksObtained = ciamarksObtained + esemarksObtained
            const totalMarks = ciaMarks + eseMarks

            const percentage = (totalMarksObtained / totalMarks) * 100
            const gradePoints = calculateGradePoints(percentage)

            semesterWeightedGradePoints += gradePoints * credit // Weighted grade points
            semesterCredits += credit // Accumulate credits
          }
        })
      })

      // Add semester data to totals
      totalWeightedGradePoints += semesterWeightedGradePoints
      totalCredits += semesterCredits
    })

    // Calculate CGPA
    const cgpa =
      totalCredits > 0
        ? (totalWeightedGradePoints / totalCredits).toFixed(2)
        : 0

    res.status(200).json({
      message: `CGPA calculated for student ${studentId}`,
      studentId: student.studentId,
      name: student.name,
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


// Function to calculate SGPA for each semester based on Student ID
export const calculateSGPA = async (req, res) => {
  const { studentId } = req.params // Get the studentId from request params

  // Find the student data by student ID
  const student = await Student.findOne({ studentId })

  if (!student) {
    console.error("Student not found.")
    return res.status(404).send("Student not found.")
  }

  // Function to calculate SGPA for a specific semester
  const getSGPA = (semesterData) => {
    const totalCredits = semesterData.results.reduce((sum, row) => {
      return (
        sum + row.types.reduce((subSum, type) => subSum + (type.credit || 0), 0)
      )
    }, 0)

    const totalCreditPoints = semesterData.results.reduce((sum, row) => {
      return (
        sum +
        row.types.reduce((subSum, type) => {
          const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
          const marksObtained =
            (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
          const percentage = (marksObtained / maxMarks) * 100

          let gradePoints
          if (percentage >= 90) {
            gradePoints = 10
          } else if (percentage >= 80) {
            gradePoints = 9
          } else if (percentage >= 70) {
            gradePoints = 8
          } else if (percentage >= 60) {
            gradePoints = 7
          } else if (percentage >= 50) {
            gradePoints = 6
          } else if (percentage >= 40) {
            gradePoints = 5
          } else if (percentage >= 30) {
            gradePoints = 4
          } else {
            gradePoints = 0
          }

          const creditPoints = (type.credit || 0) * gradePoints
          return subSum + creditPoints
        }, 0)
      )
    }, 0)

    return totalCredits > 0
      ? (totalCreditPoints / totalCredits).toFixed(2)
      : "N/A"
  }

  // Get SGPA for each semester
  const sgpas = student.semesters.map((semesterData) => {
    return {
      semester: semesterData.semester,
      sgpa: getSGPA(semesterData),
    }
  })

  // Return the SGPA for each semester
  return res.status(200).json(sgpas)
}


// 
export const calculateCGPASGPA = async (req, res) => {
  const { studentId } = req.params // Get the studentId from request params

  // Find the student data by student ID
  const student = await Student.findOne({ studentId })

  if (!student) {
    console.error("Student not found.")
    return res.status(404).send("Student not found.")
  }

  // Function to calculate SGPA for a specific semester
  const getSGPA = (semesterData) => {
    const totalCredits = semesterData.results.reduce((sum, row) => {
      return (
        sum + row.types.reduce((subSum, type) => subSum + (type.credit || 0), 0)
      )
    }, 0)

    const totalCreditPoints = semesterData.results.reduce((sum, row) => {
      return (
        sum +
        row.types.reduce((subSum, type) => {
          const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
          const marksObtained =
            (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
          const percentage = (marksObtained / maxMarks) * 100

          let gradePoints
          if (percentage >= 90) {
            gradePoints = 10
          } else if (percentage >= 80) {
            gradePoints = 9
          } else if (percentage >= 70) {
            gradePoints = 8
          } else if (percentage >= 60) {
            gradePoints = 7
          } else if (percentage >= 50) {
            gradePoints = 6
          } else if (percentage >= 40) {
            gradePoints = 5
          } else if (percentage >= 30) {
            gradePoints = 4
          } else {
            gradePoints = 0
          }

          const creditPoints = (type.credit || 0) * gradePoints
          return subSum + creditPoints
        }, 0)
      )
    }, 0)

    return totalCredits > 0
      ? (totalCreditPoints / totalCredits).toFixed(2)
      : "N/A"
  }

  let totalCredits = 0
  let totalCreditPoints = 0
  const cgpas = student.semesters.map((semesterData, index) => {
    // Calculate SGPA for the current semester
    const sgpa = getSGPA(semesterData)
    const currentCredits = semesterData.results.reduce((sum, row) => {
      return (
        sum + row.types.reduce((subSum, type) => subSum + (type.credit || 0), 0)
      )
    }, 0)

    const currentCreditPoints = semesterData.results.reduce((sum, row) => {
      return (
        sum +
        row.types.reduce((subSum, type) => {
          const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
          const marksObtained =
            (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
          const percentage = (marksObtained / maxMarks) * 100

          let gradePoints
          if (percentage >= 90) {
            gradePoints = 10
          } else if (percentage >= 80) {
            gradePoints = 9
          } else if (percentage >= 70) {
            gradePoints = 8
          } else if (percentage >= 60) {
            gradePoints = 7
          } else if (percentage >= 50) {
            gradePoints = 6
          } else if (percentage >= 40) {
            gradePoints = 5
          } else if (percentage >= 30) {
            gradePoints = 4
          } else {
            gradePoints = 0
          }

          const creditPoints = (type.credit || 0) * gradePoints
          return subSum + creditPoints
        }, 0)
      )
    }, 0)

    // Update total credits and total credit points
    totalCredits += currentCredits
    totalCreditPoints += currentCreditPoints

    // Calculate the CGPA so far
    const cgpa =
      totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : "N/A"

    return {
      semester: semesterData.semester,
      sgpa: sgpa,
      cgpa: cgpa, // Cumulative CGPA
    }
  })

  // Return the SGPA and CGPA for each semester
  return res.status(200).json(cgpas)
}


export const calculateGPA = async (req, res) => {
  const { studentId } = req.params // Get the studentId from request params

  // Find the student data by student ID
  const student = await Student.findOne({ studentId })

  if (!student) {
    console.error("Student not found.")
    return res.status(404).send("Student not found.")
  }

  // Function to calculate SGPA for a specific semester
  const getSGPA = (semesterData) => {
    const totalCredits = semesterData.results.reduce((sum, row) => {
      return (
        sum + row.types.reduce((subSum, type) => subSum + (type.credit || 0), 0)
      )
    }, 0)

    const totalCreditPoints = semesterData.results.reduce((sum, row) => {
      return (
        sum +
        row.types.reduce((subSum, type) => {
          const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
          const marksObtained =
            (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
          const percentage = (marksObtained / maxMarks) * 100

          let gradePoints
          if (percentage >= 90) {
            gradePoints = 10
          } else if (percentage >= 80) {
            gradePoints = 9
          } else if (percentage >= 70) {
            gradePoints = 8
          } else if (percentage >= 60) {
            gradePoints = 7
          } else if (percentage >= 50) {
            gradePoints = 6
          } else if (percentage >= 40) {
            gradePoints = 5
          } else if (percentage >= 30) {
            gradePoints = 4
          } else {
            gradePoints = 0
          }

          const creditPoints = (type.credit || 0) * gradePoints
          return subSum + creditPoints
        }, 0)
      )
    }, 0)

    return totalCredits > 0
      ? (totalCreditPoints / totalCredits).toFixed(2)
      : "N/A"
  }

  let totalCredits = 0
  let totalCreditPoints = 0
  const cgpas = student.semesters.map((semesterData, index) => {
    // Calculate SGPA for the current semester
    const sgpa = getSGPA(semesterData)
    const currentCredits = semesterData.results.reduce((sum, row) => {
      return (
        sum + row.types.reduce((subSum, type) => subSum + (type.credit || 0), 0)
      )
    }, 0)

    const currentCreditPoints = semesterData.results.reduce((sum, row) => {
      return (
        sum +
        row.types.reduce((subSum, type) => {
          const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
          const marksObtained =
            (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
          const percentage = (marksObtained / maxMarks) * 100

          let gradePoints
          if (percentage >= 90) {
            gradePoints = 10
          } else if (percentage >= 80) {
            gradePoints = 9
          } else if (percentage >= 70) {
            gradePoints = 8
          } else if (percentage >= 60) {
            gradePoints = 7
          } else if (percentage >= 50) {
            gradePoints = 6
          } else if (percentage >= 40) {
            gradePoints = 5
          } else if (percentage >= 30) {
            gradePoints = 4
          } else {
            gradePoints = 0
          }

          const creditPoints = (type.credit || 0) * gradePoints
          return subSum + creditPoints
        }, 0)
      )
    }, 0)

    // Update total credits and total credit points
    totalCredits += currentCredits
    totalCreditPoints += currentCreditPoints

    // Calculate the CGPA so far
    const cgpa =
      totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : "N/A"

    return {
      semester: semesterData.semester,
      sgpa: sgpa,
      cgpa: cgpa, // Cumulative CGPA
      totalCredits: currentCredits,
      totalCreditPoints: currentCreditPoints,
      maxMarks: semesterData.results.reduce((sum, row) => {
        return (
          sum +
          row.types.reduce(
            (subSum, type) =>
              subSum + (type.ciaMarks || 0) + (type.eseMarks || 0),
            0
          )
        )
      }, 0),
      totalMarks: semesterData.results.reduce((sum, row) => {
        return (
          sum +
          row.types.reduce(
            (subSum, type) =>
              subSum +
              (type.ciamarksObtained || 0) +
              (type.esemarksObtained || 0),
            0
          )
        )
      }, 0),
      percentageObtained:
        semesterData.results.reduce((sum, row) => {
          return (
            sum +
            row.types.reduce((subSum, type) => {
              const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
              const marksObtained =
                (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
              return subSum + (marksObtained / maxMarks) * 100
            }, 0)
          )
        }, 0) / semesterData.results.length || 0,
    }
  })

  // Calculate YGPA based on number of semesters
  const ygpas = []
  for (let i = 0; i < student.semesters.length; i += 2) {
    const yearData = {
      year: Math.ceil((i + 1) / 2),
    }

    const sem1SGPA = parseFloat(cgpas[i]?.sgpa || 0)
    const sem2SGPA = parseFloat(cgpas[i + 1]?.sgpa || 0)
    if (sem2SGPA) {
      yearData.ygpa = ((sem1SGPA + sem2SGPA) / 2).toFixed(2)
    } else {
      yearData.ygpa = sem1SGPA.toFixed(2) // For odd semesters, take only the first semester's SGPA
    }

    ygpas.push(yearData)
  }

  // Return the SGPA, CGPA, and YGPA for each semester and year
  return res.status(200).json({
    semesters: cgpas,
    ygpa: ygpas,
  })
}








