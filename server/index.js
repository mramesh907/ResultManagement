import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import helmet from "helmet"
import connectDB from "./config/connectDB.js"
import fileUpload from "express-fileupload"
import studentRoutes from "./routes/student.route.js"
import authRouters from "./routes/auth.route.js"

const app = express()

// CORS Configuration
const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL || "*", // Allow frontend origin
  allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  methods: ["GET", "POST", "OPTIONS"], // Allow necessary methods
}

app.use(cors(corsOptions))

// Handle preflight (OPTIONS) requests explicitly
app.options("*", cors(corsOptions))

// Express middlewares
app.use(express.json())
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)
app.use(fileUpload())

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Student Management System",
  })
})

app.use("/api/auth", authRouters)
app.use("/api/students", studentRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "An internal error occurred." })
})

// Connect to the database and start the server
connectDB().then(() => {
  const PORT = process.env.PORT || 8080
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})
