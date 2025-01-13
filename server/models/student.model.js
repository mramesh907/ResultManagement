import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    roll: { type: String, required: true },
    no: { type: String, required: true },
    registrationNo: { type: String, required: true },
    session: { type: String, required: true },
    year: { type: String, required: true },
    semesters: [
      {
        semester: {
          type: String,
          required: true,
          enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
        },
        results: [
          {
            subject: { type: String, required: true }, // Subject name
            course: { type: String, required: true }, // e.g., DSC, SEC
            paper: { type: String, required: true }, // e.g., BCADSC-101
            types: [
              {
                type: { type: String, required: true }, // e.g., Th, Proj
                credit: { type: Number, required: false, min: 0 }, // Credit points moved here
                ciaMarks: { type: Number, required: true, min: 0 }, // Marks in CIA
                eseMarks: { type: Number, required: true, min: 0 }, // Marks in ESE
                ciamarksObtained: { type: Number, required: true, min: 0 }, // Total marks (CIA)
                esemarksObtained: { type: Number, required: true, min: 0 }, // Total marks (ESE)
              },
            ], // Array for multiple paper types
          },
        ],
      },
    ],
  },
  { timestamps: true }
)

const StudentModel = mongoose.model("Student", studentSchema)

export default StudentModel
