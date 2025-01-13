import mongoose from "mongoose"

const scholarshipSchema = new mongoose.Schema({
  name: String, // Name of the scholarship
  description: String, // Description of the scholarship
  eligibility: {
    minCGPA: Number, // Minimum CGPA required for eligibility
    maxIncome: Number, // Maximum family income to be eligible
    targetGroup: String, // Target group (e.g., All, Female, Minority, etc.)
  },
  rewardAmount: Number, // Scholarship reward amount
  applicationDeadline: Date, // Deadline for scholarship application
  applyLink: String, // Direct apply link to the scholarship portal
  officialWebsite: String, // Official website for more details
})

const Scholarship = mongoose.model("Scholarship", scholarshipSchema)

export default Scholarship
