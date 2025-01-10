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

// CORS configuration for all routes
const corsOptions = {
  origin:
    process.env.FRONTEND_URL || "https://result-management-pq7v.vercel.app", // Allow frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow methods
  allowedHeaders: ["Content-Type"], // Allow content-type header for non-login routes
  credentials: true, // Allow credentials
}

// Apply CORS middleware globally
app.use(cors(corsOptions))

// CORS configuration for login route where Authorization header is required
app.use(
  "/api/auth/signin",
  cors({
    origin:
      process.env.FRONTEND_URL || "https://result-management-pq7v.vercel.app",
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization header only for this route
    credentials: true,
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
