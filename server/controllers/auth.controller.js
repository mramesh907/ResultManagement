import jwt from "jsonwebtoken"

const allowedUsers = [
  { email: "maityramesh907@gmail.com", password: "password1" },
  { email: "krishnagopal.dhal@midnaporecollege.ac.in", password: "password2" },
]

export const signin = (req, res) => {
  const { email, password } = req.body

  // Check if the email and password match an allowed user
  const user = allowedUsers.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" })
  }

  // Generate JWT token
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })

  res.status(200).json({ message: "Sign in successful", token })
}
