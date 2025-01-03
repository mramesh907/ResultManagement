import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi" // Import the SummaryApi

const Admin = () => {
  // State for email and password authentication
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault()
    // Hard-coded credentials (You can replace with API for real authentication)
    const validEmail1 = "maityramesh907@gmail.com"
const validPassword1 = "admin123"
const validEmail2 = "krishnagopal.dhal@midnaporecollege.ac.in"
const validPassword2 = "admin123"

if ((email === validEmail1 && password === validPassword1) || 
    (email === validEmail2 && password === validPassword2)) {
  setIsAuthenticated(true)
  toast.success("Login successful!")
} else {
  toast.error("Invalid email or password")
}

  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  // Handle semester change for Top Student
  const handleSemesterChange = (e) => {
    setSemester(e.target.value)
  }

  const handleMarksChange = (e) => {
    setMarks({
      ...marks,
      [e.target.name]: e.target.value,
    })
  }

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

    const marksData = {
      results: {
        marks: marks, // Wrap the marks object inside the results object
      },
    }

    try {
      await SummaryApi.updateStudentResults(studentId, semester, marksData)
      toast.success("Marks added successfully!")
      setStudentId("")
      setSemester("")
      setMarks({})
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

  return (
    <div className="p-6">
      {!isAuthenticated ? (
        <div>
          {/* Login Form */}
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleLogin} className="mb-6">
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 text-sm border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 text-sm border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full"
            >
              Login
            </button>
          </form>
        </div>
      ):(
      <div>
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      {/* File Upload Section */}
      <div className="mb-6">
        <p className="text-xl font-bold mb-4">Upload Students Excel</p>

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
                <div key={subject} className="flex items-center space-x-4 mb-3">
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
            <h4 className="font-semibold">Top Student: {topStudent.name}</h4>
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
      </div>
      </div>
      )}
    </div>
    // End of Container
  )
}

export default Admin
