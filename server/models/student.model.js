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
        semester: { type: String, required: true }, // Semester number (e.g., 1, 2, etc.)
        results: [
          {
            subject: { type: String, required: true }, // Subject name
            mark: { type: Number, required: true, min: 0, max: 100 }, // Marks for the subject (0-100)
          },
        ],
      },
    ],
  },
  { timestamps: true }
)

const StudentModel = mongoose.model("Student", studentSchema)

export default StudentModel
