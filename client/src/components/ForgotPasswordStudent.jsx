import React, { useState } from "react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import SummaryApi from "../common/SummaryApi" // Adjust the import path if needed
import { FaEye, FaEyeSlash } from "react-icons/fa"
const ForgotPasswordStudent = () => {
  const [studentId, setStudentId] = useState("")
  const [studentNumber, setStudentNumber] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false) // State to toggle new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // State to toggle confirm password visibility
  const [studentVerified, setStudentVerified] = useState(false)
  const [timer, setTimer] = useState(0) // Timer state
  const navigate = useNavigate() // Hook for navigation

  const verifyStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await SummaryApi.verifyStudent(studentId, studentNumber) // Send student ID and number in the body
      if (response.status) {
        setStudentVerified(true)
        toast.success("Student verified! You can now reset your password.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error verifying student.")
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    try {
      const response = await SummaryApi.resetStudentPassword(
        studentId,
        newPassword
      ) // Send student ID and new password in the body

      if (response.status) {
        toast.success("Password reset successful! You can now log in.")
        // Start a 2-second timer and then redirect
        let timeLeft = 2 // Timer for 2 seconds
        setTimer(timeLeft)

        const interval = setInterval(() => {
          timeLeft -= 1
          setTimer(timeLeft)

          if (timeLeft <= 0) {
            clearInterval(interval)
            navigate("/student") // Redirect to student page after 2 seconds
          }
        }, 1000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 shadow-md rounded-lg p-8 w-full max-w-md border border-blue-200">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Forgot Password
        </h2>
        {!studentVerified ? (
          <form onSubmit={verifyStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Number
              </label>
              <input
                type="text"
                placeholder="Enter your student number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-300"
            >
              Verify Student
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            {/* New Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-300"
            >
              Reset Password
            </button>

            {/* Timer Message */}
            {timer > 0 && (
              <p className="text-sm text-center mt-3 text-gray-500">
                Redirecting to student page in {timer} second
                {timer !== 1 ? "s" : ""}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordStudent
