import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi.js"
import generatePDF from "../utils/generatePDF.js" // Import the generatePDF function
import StudentNavbar from "./StudentNavbar" // Import the StudentNavbar
import ScholarshipList from "../components/ScholarshipList.jsx"
import CompareStudent from "../components/CompareStudent.jsx"
import { FaEye, FaEyeSlash } from "react-icons/fa"
const Student = () => {
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [semester, setSemester] = useState("")
  const [semesterData, setSemesterData] = useState(null)
  const [gpa, setGPA] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)
  const [cgpa, setCGPA] = useState(null)
  const [familyIncome, setFamilyIncome] = useState("")
  const [eligibleScholarships, setEligibleScholarships] = useState([])
  const [studentId1, setStudentId1] = useState("")
  const [studentId2, setStudentId2] = useState("")
  const [compsemester, setCompSemester] = useState("")
  const [selectedSection, setSelectedSection] = useState("marksheet") // New state to track the selected section
  const [comparisonData, setComparisonData] = useState([])
  const [dataFetchedSuccessfully, setDataFetchedSuccessfully] = useState(false)

  // Handle login/authentication
  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      toast.error("Please fill in both Student ID and Password.")
      return
    }

    setLoading(true)
    toast.loading("Authenticating...")

    try {
      const response = await SummaryApi.authenticateStudent(studentId, password) // API for authentication
      console.log(response)
      if (response && response.success) {
        setAuthenticated(true) // Set authenticated to true on success
        toast.dismiss()
        toast.success("Authentication successful!")
      } else {
        toast.dismiss()
        toast.error("Invalid Student ID or Password.")
      }
    } catch (error) {
      toast.dismiss()
      toast.error("Error during authentication. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentData = async () => {
    if (!studentId.trim() || !semester.trim()) {
      toast.error("Please fill in both Student ID and Semester.")
      return
    }

    setLoading(true)
    setFetchAttempted(false)
    setDataFetchedSuccessfully(false) // Reset success state
    toast.loading("Generating PDF...")

    try {
      const response = await SummaryApi.fetchStudentDetails(studentId, semester)
      const gparesponse = await SummaryApi.calculateGPA(studentId)
      if (response && response.semester && gparesponse) {
        setSemesterData(response)
        setGPA(gparesponse)
        setFetchAttempted(true)
        setDataFetchedSuccessfully(true) // Set success state
        toast.dismiss()
        toast.success("PDF generated successfully!")
      } else {
        setSemesterData(null)
        setGPA(null)
        setFetchAttempted(true)
        toast.dismiss()
        toast.error("No data found for this student and semester.")
      }
    } catch (error) {
      setSemesterData(null)
      setGPA(null)
      setFetchAttempted(true)
       setDataFetchedSuccessfully(false)
      toast.dismiss()
      if (error.response && error.response.status === 404) {
        toast.error("No data found for this student and semester.")
      } else {
        toast.error("Error fetching data. Please try again later.")
      }
    } finally {
      setLoading(false)
      // setStudentId("")
      // setSemester("")
    }
  }

  const handleGeneratePDF = (preview = false) => {
    if (semesterData) {
      generatePDF(semesterData, gpa, preview)
    }
  }

  const fetchScholarships = async () => {
    if (!cgpa || !familyIncome) {
      toast.error("Please enter both CGPA and Family Income.")
      return
    }
    if (cgpa > 10 || cgpa < 0) {
      toast.error("CGPA must be between 0 and 10.")
      return
    }
    if (familyIncome < 0) {
      toast.error("Family Income must be a positive number.")
      return
    }

    try {
      const scholarshipResponse = await SummaryApi.getEligibleScholarships(
        cgpa,
        familyIncome
      )
      setEligibleScholarships(scholarshipResponse)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setEligibleScholarships([])
        toast.error("No eligible scholarships found.")
      } else {
        toast.error("Error fetching scholarships. Please try again later.")
      }
    }
  }

  const compareStudents = async () => {
    if (!studentId1 || !studentId2 || !compsemester) {
      toast.error("Please fill in both student IDs and select a semester.")
      return
    }
    try {
      const comparisonResponse = await SummaryApi.getCompareResults(
        studentId1,
        studentId2,
        compsemester
      )

      if (comparisonResponse && comparisonResponse.length > 0) {
        setComparisonData(comparisonResponse)
        toast.success("Comparison results fetched successfully!")
      } else {
        setComparisonData(null)
        toast.error("No comparison data found.")
      }
    } catch (error) {
      setComparisonData(null)
      if (error.response && error.response.status === 404) {
        toast.error("No comparison data found.")
      } else {
        toast.error("Error fetching comparison data. Please try again later.")
      }
    }
  }

  return (
    <div className="p-6">
      {/* Student Navbar */}
      <StudentNavbar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
      />

      {selectedSection === "marksheet" && (
        <div className="mt-6 max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-300 hover:shadow-2xl">
          <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
            Student Panel
          </h2>

          {!authenticated ? (
            <>
              {/* Login Form */}
              <div className="mb-6">
                <label
                  htmlFor="studentId"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Student ID:
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter Student ID"
                  className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="password"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Password:
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-12 text-gray-500"
                >
                  {showNewPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`p-3 w-full rounded-md text-white transition duration-300 ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
              <p className="mt-6 text-center text-sm text-gray-600">
                Forgot your password?{" "}
                <a
                  href="/forgot-student-password"
                  className="text-blue-500 hover:underline"
                >
                  Reset it here
                </a>
              </p>
            </>
          ) : (
            <>
              {/* Semester Selection */}
              {!dataFetchedSuccessfully && (
                <div className="mb-6">
                  {/* Semester */}
                  <label
                    htmlFor="semester"
                    className="block font-semibold text-gray-700 mb-2"
                  >
                    Semester:
                  </label>
                  <input
                    type="text"
                    value={semester || ""}
                    id="semester"
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Enter Semester (e.g. 1, 2, 3, 4, 5, 6, 7, 8)"
                    className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4 mx-auto"
                  />
                </div>
              )}
              {/* Fetch Data Button */}
              {!dataFetchedSuccessfully && (
                <button
                  onClick={fetchStudentData}
                  disabled={loading}
                  className={`p-3 w-full rounded-md text-white transition duration-300 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {loading ? "Fetching Data..." : "Get Marksheet"}
                </button>
              )}

              {/* Error Message */}
              {fetchAttempted && semesterData === null && (
                <p className="text-red-600 mt-4 text-sm text-center">
                  No valid data found for the provided Student ID and Semester.
                </p>
              )}

              {/* Display Semester Data & Buttons */}
              {dataFetchedSuccessfully &&
                semesterData &&
                semesterData.semester && (
                  <div className="mt-6">
                    <h3 className="text-2xl font-semibold text-blue-700 mb-4">
                      Student Semester Marksheet
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                      {/* Preview PDF Button */}
                      <button
                        onClick={() => handleGeneratePDF(true)} // Preview PDF
                        className="bg-yellow-500 text-white p-3 rounded-md hover:bg-yellow-600 w-full md:w-auto"
                      >
                        Preview PDF
                      </button>

                      {/* Download PDF Button */}
                      <button
                        onClick={() => handleGeneratePDF()} // Download PDF
                        className="bg-green-500 text-white p-3 rounded-md hover:bg-green-600 w-full md:w-auto"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {selectedSection === "scholarships" && (
        <div className="mt-6 max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-300 hover:shadow-2xl">
          <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            Check for Eligible Scholarships
          </h3>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="cgpa"
                className="block font-semibold mb-2 text-gray-700"
              >
                Enter CGPA:
              </label>
              <input
                type="text"
                value={cgpa || ""}
                id="cgpa"
                onChange={(e) => {
                  const value = e.target.value
                  // Allow only numbers and prevent empty values
                  if (/^\d*$/.test(value)) {
                    setCGPA(value)
                  }
                }}
                placeholder="Enter CGPA"
                className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>
            <div>
              <label
                htmlFor="familyIncome"
                className="block font-semibold mb-2 text-gray-700"
              >
                Enter Family Income:
              </label>
              <input
                type="text"
                id="familyIncome"
                value={familyIncome || ""}
                onChange={(e) => {
                  const value = e.target.value
                  // Allow only numbers and prevent empty values
                  if (/^\d*$/.test(value)) {
                    setFamilyIncome(value)
                  }
                }}
                placeholder="Enter Family Income"
                className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>
          </div>

          <button
            onClick={fetchScholarships}
            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 w-full md:w-auto"
          >
            Check Scholarships
          </button>

          {/* Display Multiple Scholarships */}
          <ScholarshipList eligibleScholarships={eligibleScholarships} />
        </div>
      )}

      {/* Comparison Section */}
      {selectedSection === "comparison" && (
        <div className="mb-6 max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl border border-yellow-300 mt-4 hover:shadow-2xl">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 text-center">
            Compare Students
          </h3>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Input for Student 1 */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-gray-800">
                Student ID 1:
              </label>
              <input
                type="text"
                value={studentId1 || ""}
                onChange={(e) => setStudentId1(e.target.value)}
                placeholder="Enter Student ID 1"
                className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>

            {/* Input for Student 2 */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Student ID 2:
              </label>
              <input
                type="text"
                value={studentId2 || ""}
                onChange={(e) => setStudentId2(e.target.value)}
                placeholder="Enter Student ID 2"
                className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>
          </div>

          {/* Input for Semester */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">
              Semester:
            </label>
            <input
              type="text"
              value={compsemester || ""}
              onChange={(e) => setCompSemester(e.target.value)}
              placeholder="Enter Semester"
              className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2 bg-blue-50"
            />
          </div>

          {/* Button to Fetch Comparison Data */}
          <button
            onClick={compareStudents}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-md hover:from-purple-600 hover:to-indigo-700 transition duration-300 w-full md:w-auto"
          >
            Compare Students
          </button>

          {/* Display Comparison Data */}
          <CompareStudent comparisonData={comparisonData} />
        </div>
      )}
    </div>
  )
}

export default Student
