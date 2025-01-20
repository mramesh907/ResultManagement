import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js" // Import the User model
import crypto from "crypto"

// Sign-up Route
export const signup = async (req, res) => {
  const { email, password } = req.body

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

    res
      .status(201)
      .json({ status: true, message: "User registered successfully" })
  } catch (err) {
    res.status(500).json({ message: "Server error Ramesh" })
  }
}

// Sign-in Route (Login)
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: true,
        success: false,
      })
    }
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
    res.status(500).json({ message: "Server error" })
  }
}

// Forget Password Route
export const forgetPassword = async (req, res) => {
  const { email } = req.body

  try {
    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour expiry

    // Save the reset token and expiry to the user's document
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpiry
    await user.save()

    res.status(200).json({
      message: "Password reset token generated",
      resetToken, // For testing purposes; in production, don't return the token here.
    })
  } catch (err) {
    console.error("Error generating reset token:", err)
    res.status(500).json({ message: "Server error" })
  }
}

// Reset Password Route
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" })
  }

  try {
    // Find the user with the reset token and ensure it's not expired
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(newPassword, salt)

    // Update the user's password and clear the reset token and expiry
    user.password = hashedPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null

    await user.save()

    res.status(200).json({ message: "Password updated successfully" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// Check Email for forget password
export const checkEmailExists = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res
      .status(200)
      .json({
        status: true,
        message: "Email exists, proceed to change password",
      })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// Change Password
export const changePassword = async (req, res) => {
  const { email, newPassword } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(newPassword, salt)

    // Update the user's password
    user.password = hashedPassword
    await user.save()
    res
      .status(200)
      .json({ status: true, message: "Password changed successfully" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}



