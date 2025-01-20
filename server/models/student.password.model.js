import mongoose from "mongoose"
import bcrypt from "bcrypt"
import StudentModel from "./student.model.js" // Import the Student model

const studentPasswordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
)



const StudentPasswordModel = mongoose.model(
  "StudentPassword",
  studentPasswordSchema
)
export default StudentPasswordModel
