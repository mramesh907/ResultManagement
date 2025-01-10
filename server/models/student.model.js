import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    roll: { type: String, required: true },
    registrationNo: { type: String, required: true },
    session: { type: String, required: true },
    year: { type: String, required: true },
    semesters: [
      {
        semester: {
          type: String,
          required: true,
          enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
        }, // Semester number (e.g., 1, 2, etc.)
        results: [
          {
            subject: { type: String, required: true }, // Subject name
            mark: { type: Number, required: true, min: 0, max: 100 }, // Marks for the subject (0-100)
            credit: { type: Number, required: false, min: 0 },
            course: { type: String, required: true }, // e.g., DSC, SEC
            paper: { type: String, required: true }, // e.g., BCA, NUTRITION & HEALTH
            paper: { type: String, required: true }, // e.g., BCADSC-101 (Programming in C)
            type: { type: String, required: true }, // e.g., Th, Th/Proj
            maxMarks: { type: Number, required: true }, // e.g., 50
          },
        ],
      },
    ],
  },
  { timestamps: true }
)

const StudentModel = mongoose.model("Student", studentSchema)

export default StudentModel
