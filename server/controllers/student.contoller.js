import Student from "../models/student.model.js"
import StudentPasswordModel from "../models/student.password.model.js"
import { generateDefaultPassword } from "../utils/generateDefaultPassword.js"
import bcrypt from "bcrypt"
import xlsx from "xlsx"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { error } from "console"
// import upload from "../config/upload.js"

// Get the current directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// Create Password for a new student
export const createStudentPassword = async (studentId) => {
  try {
    const student = await Student.findOne({ studentId })
    if (!student) {
      throw new Error("Student not found.")
    }

    // Generate the default password using studentId and no
    const defaultPassword = `${student.studentId}-${student.no}`

    // Hash the default password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(defaultPassword, salt)

    // Create and save the password for the student
    const newPassword = new StudentPasswordModel({
      studentId: student._id,
      password: hashedPassword,
    })

    const savedPassword = await newPassword.save()
    // console.log("Password created and hashed successfully.")

    // Return the saved password or success message
    return {
      message: "Password created and hashed successfully.",
      studentId: studentId,
    }
  } catch (error) {
    console.error("Error creating student password:", error)
    throw new Error("Error creating student password.")
  }
}

export const verifyStudent=async(req,res)=>{
  
  try {
    const { studentId, no } = req.body
    console.log(`From request studentId ${studentId} no ${no}`) // Log the studentId and no (studentId no)
    const student = await Student.findOne({ studentId })
    console.log(`From Response studentId ${student.studentId} no ${student.no}`)
    if (!student) {
      return res.status(404).send("Student not found")
    }
    if (student.no !== no) {
      return res.status(404).send("Student not found")
    }

    return res.status(200).json({
      status: true,
      message: "Email exists, proceed to change password",
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Error verifying student.", error: error.message })
  }
}

// Reset Password for an existing student
export const resetStudentPassword = async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;

    // Check if the student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).send("Student not found.");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the StudentPasswordModel
    const updatedPassword = await StudentPasswordModel.findOneAndUpdate(
      { studentId: student._id },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedPassword) {
      return res.status(400).send("Error updating password.");
    }

    return res.status(200).json({
      status: true,
      message: "Password reset successfully.",
    })
  } catch (error) {
    return res.status(500).send("Error resetting password.");
  }
};

// Authenticate Student (check studentId and password)
export const authenticateStudent = async (req, res) => {
  try {
    const { studentId, password } = req.body

    // Find student by studentId
    const student = await Student.findOne({ studentId })
    if (!student) {
      return res.status(404).send("Student not found.")
    }

    // Find student password (hashed password)
    const studentPassword = await StudentPasswordModel.findOne({
      studentId: student._id,
    })

    if (!studentPassword) {
      return res.status(404).send("Password not found.")
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, studentPassword.password)

    if (!isMatch) {
      return res.status(400).send("Invalid password.")
    }

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
    })

  } catch (error) {
    return res.status(500).send("Error authenticating student.")
  }
}


// Add a new student
export const addNewStudent = async (req, res) => {
  try {
    const { studentId, name, roll, no, registrationNo, session, year, semesters } = req.body;

    // Validate required fields
    if (!studentId || !name || !roll || !no || !registrationNo || !session || !year) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Check if the student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ error: "Student with this ID already exists." });
    }

    // Create a new student document
    const newStudent = new Student({
      studentId,
      name,
      roll,
      no,
      registrationNo,
      session,
      year,
      semesters: semesters || [],
    });

    // Save the student to the database
    const savedStudent = await newStudent.save();

    // After student is created, create student password
    const getPassword=await createStudentPassword(savedStudent.studentId);

    res.status(201).json({
      message: "Student created successfully and password set.",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error adding new student:", error);
    res.status(500).json({ error: "An error occurred while adding the student." });
  }
};

export const addStudentWithDynamicSemester = async (req, res) => {
  try {
    const {
      studentId,
      name,
      roll,
      no,
      registrationNo,
      session,
      year,
      semester,
    } = req.body

    // Validate required fields
    if (
      !studentId ||
      !name ||
      !roll ||
      !no ||
      !registrationNo ||
      !session ||
      !year ||
      !semester
    ) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be filled.",
      })
    }

    // Check if the student already exists
    const existingStudent = await Student.findOne({ studentId })
      if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: "Student with this ID already exists.",
        data: existingStudent, // Include the existing student details if needed
      })
    }

    // Create a new student document with the given semester
    const newStudent = new Student({
      studentId,
      name,
      roll,
      no,
      registrationNo,
      session,
      year,
      semesters: [
        {
          semester: semester, // Dynamically set the semester from the request
          results: [], // Initialize results as an empty array
        },
      ],
    })

    // Save the student to the database
    const savedStudent = await newStudent.save()

    // Generate password for the student after creating the document
    const getPassword = await createStudentPassword(savedStudent.studentId)

    res.status(201).json({
      success: true,
      message:
        "Student created successfully with the specified semester and password set.",
      student: newStudent,
    })
  } catch (error) {
    console.error("Error adding new student with dynamic semester:", error)
    res
      .status(500)
      .json({ success: false, error: "An error occurred while adding the student." })
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

        if (data.length < 1) {
          fs.unlinkSync(filePath)
          return res.status(400).json({
            message: "The Excel file must have at least one data row.",
          })
        }

        let updatedStudents = 0
        let newStudents = 0

        for (const row of data) {
          const {
            "Student ID": studentId,
            Name: name,
            Roll: roll,
            No: no,
            "Reg No.": registrationNo,
            Session: session,
            Year: year,
            "Semester No": semester,
            ...subjectData
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

          const results = parseSubjectData(subjectData)

          const existingStudent = await Student.findOne({ studentId })

          if (existingStudent) {
            // Update the existing student if found
            const isUpdated = updateExistingStudent(
              existingStudent,
              semester,
              results
            )
            if (isUpdated) {
              updatedStudents++
              await existingStudent.save()
            }
          } else {
            // Save the new student and create password
            const newStudent = new Student({
              studentId,
              name,
              roll,
              no,
              registrationNo,
              session,
              year,
              semesters: [{ semester, results }],
            })

            // Save the new student and create password
            await newStudent.save()
            await createStudentPassword(newStudent.studentId)
            newStudents++
          }
        }

        fs.unlinkSync(filePath)

        res.status(200).json({
          message: "Students imported successfully",
          newStudents,
          updatedStudents,
        })
      } catch (error) {
        fs.unlinkSync(filePath)
        res.status(500).json({
          message: "Error processing Excel file",
          error: error.message,
        })
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "Error importing students",
      error: error.message,
    })
  }
}


// Utility function to parse subject data
const parseSubjectData = (subjectData) => {
  const results = []

  for (const key in subjectData) {
    const match = key.match(/^(.+?)\((.+?),(.+?),(.+?),(\d+),(\d+),(\d+)\)$/)
    if (match) {
      const [, paper, course, subject, type, ciaMarks, eseMarks, credit] = match
      const [ciamarksObtained, esemarksObtained] = (subjectData[key] || "0,0")
        .split(",")
        .map(Number)

      if (
        ciamarksObtained > Number(ciaMarks) ||
        esemarksObtained > Number(eseMarks)
      ) {
        throw new Error(`Invalid marks for subject: ${paper}`)
      }

      let existingPaper = results.find(
        (result) => result.paper === paper.trim()
      )
      if (!existingPaper) {
        existingPaper = {
          subject: subject.trim(),
          course: course.trim(),
          paper: paper.trim(),
          types: [],
        }
        results.push(existingPaper)
      }

      existingPaper.types.push({
        type: type.trim(),
        ciaMarks: Number(ciaMarks),
        eseMarks: Number(eseMarks),
        credit: Number(credit),
        ciamarksObtained,
        esemarksObtained,
      })
    }
  }

  return results
}

// Utility function to update existing student
const updateExistingStudent = (student, semester, results) => {
  // Check if the semester already exists for the student
  const existingSemester = student.semesters.find(
    (sem) => String(sem.semester).trim() === String(semester).trim()
  )

  if (existingSemester) {
    // If the semester exists, update the existing results
    results.forEach((newResult) => {
      const existingPaper = existingSemester.results.find(
        (res) => res.paper === newResult.paper
      )

      if (existingPaper) {
        // Update existing papers within the semester
        newResult.types.forEach((newType) => {
          const existingType = existingPaper.types.find(
            (type) => type.type === newType.type
          )

          if (existingType) {
            // Update existing type with new data
            existingType.ciaMarks = newType.ciaMarks
            existingType.eseMarks = newType.eseMarks
            existingType.credit = newType.credit
            existingType.ciamarksObtained = newType.ciamarksObtained
            existingType.esemarksObtained = newType.esemarksObtained
          } else {
            // If the type doesn't exist, add it to the paper
            existingPaper.types.push(newType)
          }
        })
      } else {
        // If the paper doesn't exist, add it to the semester
        existingSemester.results.push(newResult)
      }
    })

    return true
  } else {
    // If the semester doesn't exist, create a new semester with the results
    student.semesters.push({
      semester,
      results,
    })
    return true // Return true to indicate a new semester was created
  }

  return false // If no updates or changes were made, return false
}




// Manually update marks for student
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
        })
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


export const getStudentsBySemester = async (req, res) => {
  try {
    const { semester } = req.params

    // Validate the semester parameter
    if (
      !semester ||
      !["1", "2", "3", "4", "5", "6", "7", "8"].includes(semester)
    ) {
      return res.status(400).json({ error: "Invalid semester value." })
    }

    // Query to find students with data for the specified semester
    const students = await Student.find({
      "semesters.semester": semester,
    }).select("studentId name") // Only select studentId and name

    // If no students found, return a 404 response
    if (students.length === 0) {
      return res
        .status(404)
        .json({ error: `No students found for semester ${semester}.` })
    }

    // Respond with the list of students (only studentId and name)
    return res.status(200).json(students)
  } catch (error) {
    console.error("Error fetching students by semester:", error)
    res.status(500).json({ error: "Internal Server Error." })
  }
}

// Function to upgrade a student's semester
export const upgradeSemester = async (req, res) => {
  try {
    const { currentSemester, upgradeSemester } = req.body
    // Validate the current and upgrade semester parameters
    const validSemesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
    if (
      !currentSemester ||
      !upgradeSemester ||
      !validSemesters.includes(currentSemester) ||
      !validSemesters.includes(upgradeSemester) ||
      parseInt(upgradeSemester) !== parseInt(currentSemester) + 1
    ) {
      return res
        .status(400)
        .json({ error: "Invalid current or upgrade semester value." })
    }

    // Find students in the current semester
    const students = await Student.find({
      "semesters.semester": currentSemester,
    })

    if (students.length === 0) {
      return res
        .status(404)
        .json({ error: `No students found in semester ${currentSemester}.` })
    }

    // Separate students who already have the upgrade semester
    const studentsWithUpgradeSemester = students.filter((student) =>
      student.semesters.some((sem) => sem.semester === upgradeSemester)
    )

    const studentsWithoutUpgradeSemester = students.filter(
      (student) =>
        !student.semesters.some((sem) => sem.semester === upgradeSemester)
    )

    // If no students are eligible for an upgrade
    if (studentsWithoutUpgradeSemester.length === 0) {
      return res.status(400).json({
        error: `All students in semester ${currentSemester} already have semester ${upgradeSemester}.`,
      })
    }

    // Prepare bulk operations for students who don't have the upgrade semester
    const bulkOps = studentsWithoutUpgradeSemester.map((student) => ({
      updateOne: {
        filter: { _id: student._id },
        update: {
          $addToSet: {
            semesters: { semester: upgradeSemester, results: [] },
          },
        },
      },
    }))

    // Execute the bulk update operation
    await Student.bulkWrite(bulkOps)

    return res.status(200).json({
      success: true,
      message: `Successfully upgraded ${studentsWithoutUpgradeSemester.length} students to semester ${upgradeSemester}.`,
      alreadyUpgraded: studentsWithUpgradeSemester.length,
    })
  } catch (error) {
    console.error("Error upgrading semester:", error)
    res.status(500).json({ error: "Internal Server Error." })
  }
}


// Function to handle the submission of marks
export const submitMarks = async (req, res) => {
  try {
    const { semester, papers, students } = req.body

    // Validate that semester and papers are provided
    if (!semester || !Array.isArray(papers) || papers.length === 0) {
      return res
        .status(400)
        .json({ error: "Semester and papers are required." })
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one student is required." })
    }

    const notFoundStudents = []

    // Process each student
    for (const studentData of students) {
      const { studentId, marks } = studentData

      // Validate student data
      if (!studentId || !marks || marks.length === 0) {
        return res.status(400).json({ error: "Student data is incomplete." })
      }

      // Find the student record
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
        // If semester doesn't exist for the student, we can create it.
        semesterRecord = { semester, results: [] }
        studentRecord.semesters.push(semesterRecord)
      }

      // Process each paper for the student
      for (const paper of papers) {
        const {
          subject,
          course,
          paper: paperName,
          type,
          ciaMarks: maxCiaMarks,
          eseMarks: maxEseMarks,
        } = paper

        // Find the marks for the current paper
        const paperMarks = marks.find((mark) => mark.paperName === paperName)
        if (!paperMarks) continue // Skip if no marks for the current paper

        const { ciaMarks: obtainedCiaMarks, eseMarks: obtainedEseMarks } =
          paperMarks

        // Find or create the result record for the subject
        let subjectRecord = semesterRecord.results.find(
          (result) =>
            result.subject === subject &&
            result.course === course &&
            result.paper === paperName
        )

        // If subject doesn't exist, create a new record
        if (!subjectRecord) {
          subjectRecord = {
            subject,
            course,
            paper: paperName,
            types: [
              {
                type,
                credit: paper.credit,
                ciaMarks: maxCiaMarks,
                eseMarks: maxEseMarks,
                ciamarksObtained: obtainedCiaMarks,
                esemarksObtained: obtainedEseMarks,
              },
            ],
          }
          semesterRecord.results.push(subjectRecord)
        } else {
          // If subject exists, find or create the type record
          const typeRecord = subjectRecord.types.find((t) => t.type === type)
          if (typeRecord) {
            typeRecord.ciamarksObtained = obtainedCiaMarks
            typeRecord.esemarksObtained = obtainedEseMarks
          } else {
            // If type doesn't exist, create a new type record
            subjectRecord.types.push({
              type,
              credit: paper.credit,
              ciaMarks: maxCiaMarks,
              eseMarks: maxEseMarks,
              ciamarksObtained: obtainedCiaMarks,
              esemarksObtained: obtainedEseMarks,
            })
          }
        }
      }

      // Save the updated student record
      await studentRecord.save()
    }

    // If some students were not found, send an error response
    if (notFoundStudents.length > 0) {
      return res.status(404).json({
        error: `The following students were not found: ${notFoundStudents.join(", ")}`,
      })
    }

    // Respond with success message
    res
      .status(200)
      .json({ message: "Marks submitted successfully for all students." })
  } catch (error) {
    console.error("Error in submitting marks:", error)
    res.status(500).json({ error: "An error occurred while submitting marks." })
  }
}

// Get student details by student ID and semester number
export const getStudentByIdAndSemester = async (req, res) => {
  const { studentId, semester } = req.params // Extract studentId and semester from the request parameters

  try {
    // Find student by studentId and filter for the specific semester
    const student = await Student.findOne({
      studentId,
      "semesters.semester": semester, // Check if the semester exists in the student's semesters array
    })

    if (!student) {
      return res.status(404).json({
        message: `Student with ID ${studentId} not found or semester ${semester} not found`,
      })
    }

    // Find the semester details inside the student's semesters array
    const semesterDetails = student.semesters.find(
      (sem) => sem.semester === semester
    )

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
    }))

    res.status(200).json({
      studentId: student.studentId,
      name: student.name,
      roll: student.roll,
      no: student.no,
      registrationNo: student.registrationNo,
      session: student.session,
      year: student.year,
      semester: {
        semester: semesterDetails.semester,
        results: subjectsDetails,
      },
    })
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      message: "Error retrieving student data",
      error: error.message,
    })
  }
}

// Check if student exists
export const checkStudentExist = async (req, res) => {
  const { studentId } = req.params

  try {
    // Query the database to check if the student exists by studentId
    const student = await Student.findOne({ studentId })

    if (student) {
      // If student exists, return response with success
      return res.status(200).json({
        exists: true,
        studentId: student.studentId,
        name: student.name,
        message: `Student ${student.name} found`,
      })
    } else {
      // If student does not exist, return response with error message
      return res.status(404).json({
        exists: false,
        message: `Student with ID ${studentId} not found`,
      })
    }
  } catch (error) {
    // Handle any server errors
    console.error("Error in checking student existence:", error)
    return res.status(500).json({
      message: "Server error while checking student existence",
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
      const totalMarks = semesterDetails.results.reduce((sum, result) => {
        // For each result, sum the CIA and ESE marks from all paper types
        const marksForSubject = result.types.reduce(
          (subSum, type) =>
            subSum + type.ciamarksObtained + type.esemarksObtained,
          0
        )
        return sum + marksForSubject
      }, 0)

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

    // Create an array to store total marks for each student, based on their highest semester marks
    const studentRanks = students.map((student) => {
      // Get the highest marks obtained in any semester
      const highestMarks = student.semesters.reduce((highest, semester) => {
        const semesterMarks = semester.results.reduce((sum, result) => {
          // Add marks from each paper type (CIA + ESE)
          return (
            sum +
            result.types.reduce(
              (subSum, type) =>
                subSum + type.ciamarksObtained + type.esemarksObtained,
              0
            )
          )
        }, 0)

        // Compare and get the maximum total marks for the semester
        return Math.max(highest, semesterMarks)
      }, 0)

      return {
        studentId: student.studentId,
        name: student.name,
        highestMarks, // Store the highest marks from any semester
      }
    })

    // Sort students by highestMarks in descending order
    studentRanks.sort((a, b) => b.highestMarks - a.highestMarks)

    // Get the top 5 rankers
    const topRankers = studentRanks.slice(0, 5)

    res.status(200).json({
      message: "Top 5 rankers based on highest marks in any semester",
      rankers: topRankers,
    })
  } catch (error) {
    res.status(500).json({
      message: "Error fetching top rankers",
      error: error.message,
    })
  }
}


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

// Function to calculate CGPA and SGPA for a specific student
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

    // Calculate the CGPA so far (only for the 8th semester)
    const cgpa =
      index === 7 ? (totalCreditPoints / totalCredits).toFixed(2) : null // Only set CGPA for the 8th semester

    return {
      semester: semesterData.semester,
      sgpa: sgpa,
      cgpa: cgpa, // Only set for the 8th semester
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
      percentageObtained: (() => {
        const totalMaxMarks = semesterData.results.reduce((sum, row) => {
          return (
            sum +
            row.types.reduce((subSum, type) => {
              return subSum + (type.ciaMarks || 0) + (type.eseMarks || 0)
            }, 0)
          )
        }, 0)

        const totalMarksObtained = semesterData.results.reduce((sum, row) => {
          return (
            sum +
            row.types.reduce((subSum, type) => {
              return (
                subSum +
                (type.ciamarksObtained || 0) +
                (type.esemarksObtained || 0)
              )
            }, 0)
          )
        }, 0)

        // Calculate percentage and ensure it's a number before using toFixed
        const percentage =
          totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0

        return Number(percentage).toFixed(2) // Ensure `percentage` is a number
      })(),
    }
  })

  // Calculate YGPA based on number of semesters (for even semesters)
  const ygpas = []
  for (let i = 1; i < student.semesters.length; i += 2) {
    const yearData = {
      year: Math.ceil(i / 2),
    }

    const sem1SGPA = parseFloat(cgpas[i - 1]?.sgpa || 0)
    const sem2SGPA = parseFloat(cgpas[i]?.sgpa || 0)
    if (sem2SGPA) {
      yearData.ygpa = ((sem1SGPA + sem2SGPA) / 2).toFixed(2)
    } else {
      yearData.ygpa = sem1SGPA.toFixed(2) // For odd semesters, take only the first semester's SGPA
    }

    ygpas.push(yearData)
  }

  // Return the SGPA, YGPA, and CGPA (only for 8th semester)
  return res.status(200).json({
    semesters: cgpas,
    ygpa: ygpas,
  })
}


// Comparison student
export const getComparisonStudent = async (req, res) => {
  const { studentId1, studentId2, semester } = req.params

  try {
    // Fetch data for both students for the given semester
    const student1 = await Student.findOne({
      studentId: studentId1,
      "semesters.semester": semester,
    })
    // console.log(student1);

    const student2 = await Student.findOne({
      studentId: studentId2,
      "semesters.semester": semester,
    })

    // Check if both students exist
    if (!student1 || !student2) {
      return res.status(404).json({
        message: "One or both students not found or semester data missing",
      })
    }

    // Extract results for the specified semester
    const semesterData1 = student1.semesters.find((s) => s.semester == semester)

    const semesterData2 = student2.semesters.find((s) => s.semester == semester)

    // Check if both students have results for the semester
    if (!semesterData1 || !semesterData2) {
      return res
        .status(404)
        .json({ message: "Semester data not found for one or both students" })
    }

    // Compare results paper-wise
    const comparison = semesterData1.results.map((result1, index) => {
      const result2 = semesterData2.results[index]

      // Initialize comparison data for this paper
      const comparisonData = {
        paperName: result1.paper,
        student1TotalMarks: 0,
        student2TotalMarks: 0,
        marksDifference: 0,
      }

      // Calculate total marks for both students (CIA + ESE)
      result1.types.forEach((type1, i) => {
        const type2 = result2.types[i]
        comparisonData.student1TotalMarks +=
          type1.ciamarksObtained + type1.esemarksObtained
        comparisonData.student2TotalMarks +=
          type2.ciamarksObtained + type2.esemarksObtained
      })

      // Calculate the difference in total marks
      comparisonData.marksDifference =
        comparisonData.student1TotalMarks - comparisonData.student2TotalMarks

      return comparisonData
    })

    // Send the comparison data in the response
    res.json(comparison)
  } catch (error) {
    console.error("Error comparing results:", error)
    res.status(500).json({ message: "Error comparing results", error })
  }
}

export const studentCount = async (req, res) => {
  try {
    const students = await Student.aggregate([
      { $unwind: "$semesters" },
      {
        $group: {
          _id: "$semesters.semester", // Group by semester
          count: { $sum: 1 }, // Count students per semester
        },
      },
      { $sort: { _id: 1 } }, // Sort by semester
    ])

    res.status(200).json(students)
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching semester-wise count", error })
  }
}

export const semesterPerformance = async (req, res) => {
  try {
    const performance = await Student.aggregate([
      { $unwind: "$semesters" }, // Flatten semesters array
      { $unwind: "$semesters.results" }, // Flatten results array
      { $unwind: "$semesters.results.types" }, // Flatten types array
      {
        $group: {
          _id: "$semesters.semester", // Group by semester
          avgMarks: {
            $avg: {
              $sum: [
                "$semesters.results.types.ciamarksObtained",
                "$semesters.results.types.esemarksObtained",
              ], // Sum of CIA and ESE marks
            },
          },
        },
      },
      { $sort: { _id: 1 } }, // Sort by semester
    ])

    res.status(200).json(performance)
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching semester-wise performance", error })
  }
}


export const uploadStudentsFromExcel = async (req, res) => {
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

        if (data.length < 1) {
          fs.unlinkSync(filePath)
          return res.status(400).json({
            message: "The Excel file must have at least one data row.",
          })
        }

        let newStudents = 0
        const defaultSemester = 1 // Set the default semester here

        for (const row of data) {
          const { studentId, name, roll, no, registrationNo, session, year } =
            row

          // Check for mandatory fields except semester
          if (
            !studentId ||
            !name ||
            !roll ||
            !no ||
            !registrationNo ||
            !session ||
            !year
          ) {
            fs.unlinkSync(filePath)
            return res.status(400).json({
              message: "Missing mandatory fields in the Excel file",
              row,
            })
          }

          const existingStudent = await Student.findOne({ studentId })

          if (!existingStudent) {
            // Save the new student with the default semester
            const newStudent = new Student({
              studentId,
              name,
              roll,
              no,
              registrationNo,
              session,
              year,
              semesters: [
                {
                  semester: defaultSemester, // Use the default semester
                  results: [], // Initialize results as an empty array
                },
              ],
            })

            // Save the new student and create password
            await newStudent.save()
            await createStudentPassword(newStudent.studentId)
            newStudents++
          }
        }

        fs.unlinkSync(filePath)

        res.status(200).json({
          message: "Students uploaded successfully",
          newStudents,
        })
      } catch (error) {
        fs.unlinkSync(filePath)
        res.status(500).json({
          message: "Error processing Excel file",
          error: error.message,
        })
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "Error uploading students",
      error: error.message,
    })
  }
}
