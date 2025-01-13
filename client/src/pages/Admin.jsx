import React, { useState } from "react"
import { toast } from "react-hot-toast"
import ManualMarksEntry from "../components/ManualMarksEntry"
import ScholarshipForm from "../components/ScholarshipForm"
import SummaryApi from "../common/SummaryApi"
import { FiLogOut } from "react-icons/fi"
import Navbar from "./Navbar"
import { FaFileUpload, FaDownload } from "react-icons/fa"
const Admin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  )
  const [selectedSection, setSelectedSection] = useState("upload")
  const [file, setFile] = useState(null)
  const [marks, setMarks] = useState({})
  const [subject, setSubject] = useState("")
  const [semester, setSemester] = useState("")
  const [studentId, setStudentId] = useState("")
  const [studentExists, setStudentExists] = useState(null)
  const [responseDetails, setResponseDetails] = useState({
    message: "",
    newStudents: 0,
    updatedStudents: 0,
  })
  const [uploading, setUploading] = useState(false)
  const [topStudent, setTopStudent] = useState(null)
  const [topRankers, setTopRankers] = useState([])

  const [credits, setCredits] = useState({})

  const handleCreditChange = (e) => {
    setCredits({
      ...credits,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await SummaryApi.signin(email, password)
      if (response.token) {
        localStorage.setItem("token", response.token)
        setIsAuthenticated(true)
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    toast.success("Logged out successfully!")
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSemesterChange = (e) => {
    setSemester(e.target.value)
  }

  // Handle marks
  const handleMarksChange = (e) => {
    setMarks({
      ...marks,
      [e.target.name]: e.target.value,
    })
  }

  // Handle subject
  const handleAddSubject = () => {
    if (!subject.trim()) {
      toast.error("Subject name cannot be empty!")
      return
    }
    setMarks({ ...marks, [subject]: "" })
    setSubject("")
    toast.success("Subject added successfully!")
  }

  // Upload file
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
      toast.error("Error uploading file")
    } finally {
      setUploading(false)
    }
  }

  // Check student existence
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

  // Submit marks
  const submitMarks = async () => {
    if (!studentId || !semester || Object.keys(marks).length === 0) {
      toast.error("Please fill in all fields")
      return
    }

    const resultsData = Object.keys(marks).reduce((acc, subject) => {
      acc[subject] = {
        mark: marks[subject],
        credit: credits[subject] || 0,
      }
      return acc
    }, {})

    const marksData = {
      results: resultsData,
    }

    try {
      await SummaryApi.updateMarksForSemester({
        studentId,
        semester,
        marks: marksData,
      })
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

  // Get top student
const getTopStudent = async () => {
  if (!semester) {
    toast.error("Please select a semester!")
    return
  }

  try {
    const response = await SummaryApi.getSemesterResults(semester)

    if (response) {
      const { name, totalMarks, studentId, semester: semesterData } = response

      // Check if semester matches and extract results
      if (semesterData && semesterData.semester === semester) {
        const topStudent = {
          name,
          studentId,
          totalMarks,
          semester: semesterData.semester,
          results: semesterData.results, // Correctly accessing results
        }

        setTopStudent(topStudent)
        toast.success("Top student data retrieved successfully!")
      } else {
        setTopStudent(null)
        toast.error("No top student found for the selected semester.")
      }
    } else {
      setTopStudent(null)
      toast.error("No top student found for the selected semester.")
    }
  } catch (error) {
    toast.error("Error fetching top student data.")
  }
}

  // Get top rankers
 const getTopRankers = async () => {
   try {
     const response = await SummaryApi.getTopRankers()

     if (response && response.rankers) {
       // Setting the top rankers data to state
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
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            Admin Panel
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 text-white p-2 text-sm rounded hover:bg-red-600"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </h2>
          {/* Navbar */}
          <Navbar
            onSelectSection={setSelectedSection}
            selectedSection={selectedSection}
          />
          {/* File Upload Section */}
          {/* Conditional Content Rendering */}
          {/* Conditional rendering of the Upload section */}
          {selectedSection === "upload" && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg shadow-md">
              <p className="text-2xl font-bold mb-4 text-center">
                Upload Students Excel
              </p>

              {/* Demo File Download Button */}
              <a
                href="https://drive.google.com/uc?export=download&id=1t-58BXVckDTzlkonGb5zQ3Ow1bYcKCJg"
                download
                className="flex items-center justify-center bg-green-500 text-white p-3 text-sm rounded-lg hover:bg-green-600 w-full mb-4 transition duration-200 ease-in-out"
              >
                <FaDownload className="mr-2" /> Download Demo Excel
              </a>

              {/* File Input and Upload Button side by side */}
              <div className="flex items-center justify-between mb-6">
                {/* Choose File Button */}
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 flex items-center gap-2 transition duration-200 ease-in-out"
                >
                  <FaFileUpload />
                  <span>Choose File</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  className="hidden"
                />

                {/* Upload File Button */}
                <button
                  onClick={uploadFile}
                  disabled={uploading}
                  className={`p-3 flex items-center justify-center rounded-lg ${uploading ? "bg-gray-500 text-white cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"} transition duration-200 ease-in-out w-1/3`}
                >
                  {uploading ? (
                    <>
                      <div
                        className="spinner-border text-white mr-2"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaFileUpload className="mr-2" />
                      Upload File
                    </>
                  )}
                </button>
              </div>

              {/* Response Message */}
              {responseDetails.message && (
                <div className="mt-6 text-center">
                  <p className="text-green-500 font-medium">
                    {responseDetails.message}
                  </p>
                  <p className="text-sm">
                    New Students: <strong>{responseDetails.newStudents}</strong>
                    , Updated Students:{" "}
                    <strong>{responseDetails.updatedStudents}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Manual Marks Entry Section */}
          {selectedSection === "marks" && (
            <div className="mt-6">
              {/* Manual Marks Entry Section */}
              <ManualMarksEntry />
            </div>
          )}
          {/* Top Student Section */}
          {selectedSection === "topStudent" && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Check Top Student</h3>
              <div className="mb-4">
                <select
                  onChange={handleSemesterChange}
                  className="cursor-pointer p-2 text-sm border border-gray-300 rounded w-1/2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, idx) => (
                    <option key={idx} value={idx + 1}>
                      Semester {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={getTopStudent}
                className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full"
              >
                Get Top Student
              </button>

              {topStudent && (
                <div className="mt-4 p-4 bg-gray-100 border rounded-md">
                  <h4 className="text-lg font-bold">{topStudent.name}</h4>
                  <p>Student ID: {topStudent.studentId}</p>
                  <p>Total Marks: {topStudent.totalMarks}</p>
                  <p>Semester: {topStudent.semester}</p>

                  <h5 className="text-md font-semibold mt-4">Results:</h5>
                  {topStudent.results &&
                    topStudent.results.map((result, idx) => (
                      <div key={idx} className="mt-2">
                        <h6 className="font-semibold">
                          {result.subject} - {result.course}
                        </h6>
                        {result.types &&
                          result.types.map((type, i) => (
                            <div key={i} className="mt-1">
                              <p>Type: {type.type}</p>
                              <p>Credits: {type.credit}</p>
                              <p>
                                CIA Marks: {type.ciaMarks} (Obtained:{" "}
                                {type.ciamarksObtained})
                              </p>
                              <p>
                                Ese Marks: {type.eseMarks} (Obtained:{" "}
                                {type.esemarksObtained})
                              </p>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Top Rankers Section */}
          {selectedSection === "topRankers" && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Top Rankers</h3>
              <button
                onClick={getTopRankers}
                className="bg-blue-500 text-white p-2 text-sm rounded hover:bg-blue-600 w-full"
              >
                Get Top Rankers
              </button>
              {topRankers.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Top Rankers:</h4>
                  <ul className="list-disc pl-6">
                    {topRankers.map((ranker, idx) => (
                      <li key={idx}>
                        {ranker.name} - {ranker.highestMarks} Marks
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Scholarship Form Section */}
          {selectedSection === "scholarships" && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Manage Scholarships
              </h3>
              <ScholarshipForm /> {/* Render the scholarship form here */}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Admin
