import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi" // Import the SummaryApi
import { FiLogOut } from "react-icons/fi"
const Admin = () => {
  // State for email and password authentication
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  )

  const [file, setFile] = useState(null)
  const [marks, setMarks] = useState({})
  const [subject, setSubject] = useState("")
  const [semester, setSemester] = useState("")
  const [studentId, setStudentId] = useState("")
  const [studentExists, setStudentExists] = useState(null) // Tracks if student exists
  const [responseDetails, setResponseDetails] = useState({
    message: "",
    newStudents: 0,
    updatedStudents: 0,
  })
  const [uploading, setUploading] = useState(false)
  const [topStudent, setTopStudent] = useState(null) // State for the top student in the selected semester
  const [topRankers, setTopRankers] = useState([]) // State to store top rankers
  const [credits, setCredits] = useState({}) // New state for credits
  // Function to handle credit input change
  const handleCreditChange = (e) => {
    setCredits({
      ...credits,
      [e.target.name]: e.target.value,
    })
  }

  // Handle Signup
  //  const handleSignup = async (e) => {
  //    e.preventDefault()
  //    try {
  //      const response = await SummaryApi.signUp({ email, password })
  //      if (response.data.message) {
  //        toast.success("Signup successful! You can now log in.")
  //        setEmail("")
  //        setPassword("")
  //      }
  //    } catch (err) {
  //      console.error(err)
  //      toast.error(err.response?.data?.message || "Signup failed.")
  //    }
  //  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await SummaryApi.signin(email, password)
      console.log("email:", email, "password:", password)
      if (response.token) {
        localStorage.setItem("token", response.token) // Store the token in localStorage
        setIsAuthenticated(true)
        console.log("Login successful:", response.message)
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.")
      //  console.error("Login failed:", error)
    }
  }
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    toast.success("Logged out successfully!")
  }

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  // Handle semester change for Top Student
  const handleSemesterChange = (e) => {
    setSemester(e.target.value)
  }

  // Handle marks change
  const handleMarksChange = (e) => {
    setMarks({
      ...marks,
      [e.target.name]: e.target.value,
    })
  }

  // Handle Add new subject
  const handleAddSubject = () => {
    if (!subject.trim()) {
      toast.error("Subject name cannot be empty!")
      return
    }
    setMarks({ ...marks, [subject]: "" })
    setSubject("")
    toast.success("Subject added successfully!")
  }

  // Excel sheet upload
  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await SummaryApi.resultsUpload(formData)
      if (response && response.message) {
        const { message, newStudents, updatedStudents } = response
        toast.success(message)
        setResponseDetails({
          message,
          newStudents,
          updatedStudents,
        })
      } else {
        toast.error("Failed to upload file. No response data received.")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Error uploading file")
    } finally {
      setUploading(false)
    }
  }

  // Function to check student existence
  const checkStudentExistence = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter a valid Student ID")
      return
    }

    try {
      const response = await SummaryApi.checkStudentExist(studentId)
      if (response.exists) {
        setStudentExists(true)
        toast.success("Student found!")
      }
    } catch (error) {
      setStudentExists(false)
      toast.error("Student does not exist in the system.")
    }
  }

  // Function to submit marks
  const submitMarks = async () => {
    if (!studentId || !semester || Object.keys(marks).length === 0) {
      toast.error("Please fill in all fields")
      return
    }
    // Prepare the results data with both marks and credits
    const resultsData = Object.keys(marks).reduce((acc, subject) => {
      acc[subject] = {
        mark: marks[subject], // Existing mark
        credit: credits[subject] || 0, // Credit (default to 0 if not provided)
      }
      return acc
    }, {})

    // Prepare the data for sending to the backend
    const marksData = {
      results: resultsData,
    }

    try {
      await SummaryApi.updateStudentResults(studentId, semester, marksData)
      toast.success("Marks added successfully!")
      setStudentId("")
      setSemester("")
      setMarks({})
      setCredits({})
      setSubject("")
      setStudentExists(null)
    } catch (error) {
      toast.error("Error submitting marks")
    }
  }

  // Fetch top student for selected semester
  const getTopStudent = async () => {
    if (!semester) {
      toast.error("Please select a semester!")
      return
    }

    try {
      const response = await SummaryApi.getSemesterResults(semester)
      // console.log("Response data:", response)

      if (response && response.message) {
        // Destructure the response to get top student details
        const { name, totalMarks, studentId, semester } = response
        const results = semester.results // Get the results for the subjects

        // Prepare the data for the top student
        const topStudent = {
          name,
          studentId,
          totalMarks,
          semester: semester.semester, // Semester number
          results: results, // List of subjects and marks
        }

        // Update the state with the top student details
        setTopStudent(topStudent)

        toast.success("Top student data retrieved successfully!")
      } else {
        setTopStudent(null)
        toast.error("No results found for the selected semester.")
      }
    } catch (error) {
      console.error("Error fetching semester results:", error)
      toast.error("No results found for the selected semester.")
    }
  }

  // Fetch top 5 rankers across all semesters
  const getTopRankers = async () => {
    try {
      const response = await SummaryApi.getTopRankers() // Assume this calls your backend
      if (response && response.rankers) {
        setTopRankers(response.rankers)
        toast.success("Top 5 rankers fetched successfully!")
      } else {
        setTopRankers([])
        toast.error("No rankers found.")
      }
    } catch (error) {
      toast.error("Error fetching top rankers.")
    }
  }

  return (
    <div className="p-6">
      {!isAuthenticated ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Admin Authentication</h2>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mb-6">
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 text-sm border border-gray-300 rounded w-full"
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 text-sm border border-gray-300 rounded w-full mt-4"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full mt-4"
            >
              Login
            </button>
          </form>

          {/* Signup Section */}
          {/* <h3 className="text-lg mb-4">Don't have an account? Sign up!</h3>
          <form onSubmit={handleSignup}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 text-sm border border-gray-300 rounded w-full"
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 text-sm border border-gray-300 rounded w-full mt-4"
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 text-sm rounded hover:bg-green-600 w-full mt-4"
            >
              Signup
            </button> 
          </form>*/}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            Admin Panel
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 text-white p-2 text-sm rounded hover:bg-red-600"
            >
              <FiLogOut className="mr-2" /> {/* Logout icon */}
              Logout
            </button>
          </h2>

          {/* File Upload Section */}
          <div className="mb-6">
            <p className="text-xl font-bold mb-4">Upload Students Excel</p>
            {/* Button to Download Demo Excel File */}
            <a
              href="https://drive.google.com/uc?export=download&id=1t-58BXVckDTzlkonGb5zQ3Ow1bYcKCJg"
              download
              className="bg-green-500 text-white p-2 text-sm rounded hover:bg-green-600 w-full mb-4 inline-block text-center"
            >
              Download Demo Excel File
            </a>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="mb-4"
            />
            <button
              onClick={uploadFile}
              disabled={uploading}
              className={`p-2 w-full rounded ${
                uploading
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
            {responseDetails.message && (
              <div className="mt-4">
                <p className="text-green-500">{responseDetails.message}</p>
                <p>
                  New Students: {responseDetails.newStudents}, Updated Students:{" "}
                  {responseDetails.updatedStudents}
                </p>
              </div>
            )}
          </div>

          {/* Manual Marks Entry Section */}
          <div>
            <h3 className="text-xl mb-4 font-semibold">Manual Marks Entry</h3>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="p-2 text-sm border border-gray-300 rounded mb-2 min-w-40 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={checkStudentExistence}
                className="bg-yellow-500 text-white p-2 text-sm rounded hover:bg-yellow-600 w-1/2 mt-2 ml-4"
              >
                Check Student Existence
              </button>
            </div>

            {studentExists && (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter Semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="p-2 text-sm border border-gray-300 rounded w-1/2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between space-x-4">
                    <input
                      type="text"
                      placeholder="Enter Subject Name"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="p-2 text-sm border border-gray-300 rounded w-1/2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddSubject}
                      className="bg-green-500 text-white p-2 text-sm rounded hover:bg-green-600 w-1/3"
                    >
                      Add Subject
                    </button>
                  </div>
                </div>

                <div className="my-4">
                  <h4 className="text-lg font-semibold mb-3">Enter Marks</h4>
                  {Object.keys(marks).map((subject) => (
                    <div
                      key={subject}
                      className="flex items-center space-x-4 mb-3"
                    >
                      <label className="w-1/3 text-sm text-gray-700">
                        {subject}:
                      </label>
                      <input
                        type="number"
                        name={subject}
                        value={marks[subject]}
                        onChange={handleMarksChange}
                        min="0"
                        max="100"
                        className="p-2 text-sm border border-gray-300 rounded w-1/2 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        name={subject}
                        value={credits[subject] || ""}
                        onChange={handleCreditChange}
                        min="0"
                        className="p-2 text-sm border border-gray-300 rounded w-1/3 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Credits"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={submitMarks}
                  className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full"
                >
                  Submit Marks
                </button>
              </>
            )}

            {studentExists === false && (
              <p className="text-red-500 font-semibold mt-4">
                Student does not exist in the system.
              </p>
            )}
          </div>

          {/* Top Student Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Check Top Student</h3>

            {/* Semester Selection */}
            <div className="mb-4">
              <select
                onChange={handleSemesterChange}
                className="cursor-pointer p-2 text-sm border border-gray-300 rounded w-1/2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            {/* Get Top Student Button */}
            <button
              onClick={getTopStudent}
              className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full"
            >
              Get Top Student
            </button>

            {/* Display Top Student Information */}
            {topStudent && (
              <div className="mt-4 p-4 bg-gray-100 border rounded-md">
                <h4 className="font-semibold">
                  Top Student: {topStudent.name}
                </h4>
                <p>Total Marks: {topStudent.totalMarks}</p>
                <p>Student ID: {topStudent.studentId}</p>
                <p>Semester: {topStudent.semester}</p>

                {/* Display Results (Subjects and Marks) */}
                <h5 className="mt-4 text-md font-medium">Results:</h5>
                <ul>
                  {topStudent.results.map((result, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      <strong>{result.subject}:</strong> {result.mark}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Top Rankers Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Top 5 Rankers</h3>

              {/* Button to Fetch Top Rankers */}
              <button
                onClick={getTopRankers}
                className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full"
              >
                Get Top 5 Rankers
              </button>

              {/* Display Top Rankers */}
              {topRankers.length === 0 ? (
                <p className="text-gray-600 mt-4">No rankers available.</p>
              ) : (
                <div className="mt-4 p-4 bg-gray-100 border rounded-md">
                  <h4 className="font-semibold mb-2">Top Rankers:</h4>
                  <ol className="list-decimal ml-6 space-y-2">
                    {topRankers.map((ranker, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <strong>Name:</strong> {ranker.name} <br />
                        <strong>Student ID:</strong> {ranker.studentId} <br />
                        <strong>Total Marks:</strong> {ranker.totalMarks} <br />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* End of isAuthenticated */}
    </div>
    // End of Container
  )
}

export default Admin
