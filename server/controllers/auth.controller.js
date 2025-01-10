import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js" // Import the User model

export const signup = async (req, res) => {
  const { email, password } = req.body
  console.log("Received email:", email)
  console.log("Received password:", password)
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash the password before saving
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
    })

    // Save the new user to the database
    await newUser.save()

    res.status(201).json({ message: "User registered successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

// Sign-in Route (Login)
export const signin = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    res.status(200).json({ message: "Sign in successful", token })
  } catch (err) {
    console.error("Error signing in:", err)
    res.status(500).json({ message: "Server error" })
  }
}
