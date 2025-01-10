import jwt from "jsonwebtoken"

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]

  if (!token) {
    return res.status(403).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // Decode the token here
    req.user = decoded // Store decoded user info in the request
    next() // Continue to the next route handler
  } catch (err) {
    res.status(401).json({ message: "Invalid token" })
  }
}

export default verifyToken
