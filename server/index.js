import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import helmet from "helmet"
import connectDB from "./config/connectDB.js"
import fileUpload from "express-fileupload"
import studentRoutes from "./routes/student.route.js"
import authRouters from "./routes/auth.route.js"
import scholarshipRoutes from "./routes/scholarship.route.js"

const app = express()
app.use(
  cors({
    credentials: true,
    origin:
      process.env.FRONTEND_URL || "https://result-management-pq7v.vercel.app", // Allow only specific frontend
    allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization header
  })
)
app.use(express.json())
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)
app.use(fileUpload())

const PORT = 8080 || process.env.PORT

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Student Management System",
  })
})
app.use("/api/auth", authRouters)
app.use("/api/students", studentRoutes)
app.use("/api/rewards", scholarshipRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "An internal error occurred." })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})
