import React, { useState } from "react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import SummaryApi from "../common/SummaryApi" // Adjust import path if needed

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [timer, setTimer] = useState(0) // Timer state
  const navigate = useNavigate() // Hook for navigation

  const verifyEmail = async (e) => {
    e.preventDefault()
    try {
      const response = await SummaryApi.checkEmail(email) // Send email in body
      if (response.status) {
        setEmailVerified(true)
        toast.success("Email verified! You can now reset your password.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error verifying email.")
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    try {
      const response = await SummaryApi.resetPassword(email, newPassword) // Send email and new password in body


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
            navigate("/admin") // Redirect to admin page after 2 seconds
          }
        }, 1000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password.")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 shadow-md rounded-lg p-8 w-full max-w-md border border-green-200">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
          Forgot Password
        </h2>
        {!emailVerified ? (
          <form onSubmit={verifyEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-300"
            >
              Verify Email
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-300"
            >
              Reset Password
            </button>
            {timer > 0 && (
              <p className="text-sm text-center mt-3 text-gray-500">
                Redirecting to admin page in {timer} second{timer !== 1 ? "s" : ""}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
