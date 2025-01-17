import React, { useState } from "react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import SummaryApi from "../common/SummaryApi" // Adjust import path if needed
import { FaEye, FaEyeSlash } from "react-icons/fa" // Import eye icons

const Signup = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [timer, setTimer] = useState(0) // Timer state
  const [passwordVisible, setPasswordVisible] = useState(false) // Password visibility toggle state
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false) // Confirm password visibility toggle state
  const navigate = useNavigate() // Hook for navigation
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords and confirm password not match!")
      return
    }

    try {
      const response = await SummaryApi.signup(email, password)

      if (response.status) {
        toast.success("Signup successful! You can now log in.")
        // Optionally redirect to login page or clear fields
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        let timeLeft = 2 // Timer for 2 seconds
        setTimer(timeLeft)

        const interval = setInterval(() => {
          timeLeft -= 1
          setTimer(timeLeft)

          if (timeLeft <= 0) {
            clearInterval(interval)
            navigate("/admin") // Redirect to admin page after 2 seconds
          }
        }, 1000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error signing up.")
    }
  }

  return (
    <div className="flex justify-center  min-h-52 bg-gray-50 px-4">
      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 shadow-md rounded-lg p-8 w-full max-w-md border border-blue-200 hover:border-blue-400 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <button
                type="button"
                className="absolute top-3 right-3"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <button
                type="button"
                className="absolute top-3 right-3"
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
                {confirmPasswordVisible ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-300"
          >
            Sign Up
          </button>
          {timer > 0 && (
            <p className="text-sm text-center mt-3 text-gray-500">
              Redirecting to admin page in {timer} second
              {timer !== 1 ? "s" : ""}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Signup
