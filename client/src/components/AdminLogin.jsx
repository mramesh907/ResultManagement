import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const AdminLogin = ({
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
  isAuthenticated,
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false)

  if (isAuthenticated) return null

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 px-4 rounded-lg">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md border border-blue-200">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 text-sm border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Reset it here
          </a>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
