import jwt from "jsonwebtoken"

const allowedUsers = ["alloweduser1@example.com", "alloweduser2@example.com"]

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." })
    }

    if (!allowedUsers.includes(user.email)) {
      return res
        .status(403)
        .json({ message: "Access denied. You are not authorized." })
    }

    req.user = user
    next()
  })
}

export default authenticateToken
