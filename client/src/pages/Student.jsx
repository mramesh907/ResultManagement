import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi.js"
import generatePDF from "../utils/generatePDF.js" // Import the generatePDF function

const Student = () => {
  const [studentId, setStudentId] = useState("")
  const [semester, setSemester] = useState("")
  const [semesterData, setSemesterData] = useState(null)
  const [gpa, setGPA] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  const fetchStudentData = async () => {
    if (!studentId.trim() || !semester.trim()) {
      toast.error("Please fill in both Student ID and Semester.")
      return
    }

    setLoading(true)
    setFetchAttempted(false)
    toast.loading("Fetching data...")

    try {
      const response = await SummaryApi.fetchStudentDetails(studentId, semester)
      const gparesponse= await SummaryApi.calculateGPA(studentId)
      if (response && response.semester && gparesponse) {
        setSemesterData(response)
        setGPA(gparesponse)
        setFetchAttempted(true)
        toast.dismiss()
        toast.success("Data fetched successfully!")
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
      toast.dismiss()
      toast.error("Error fetching data. Please try again later.")
    } finally {
      setLoading(false)
      setStudentId("")
      setSemester("")
    }
  }

  const handleGeneratePDF = (preview = false) => {
    if (semesterData) {
      generatePDF(semesterData,gpa, preview)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Panel</h2>

      <div className="mb-4">
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
          className="p-2 border border-gray-300 rounded mb-2 w-full"
        />
        <input
          type="text"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          placeholder="Enter Semester"
          className="p-2 border border-gray-300 rounded mb-2 w-full"
        />
        <button
          onClick={fetchStudentData}
          disabled={loading}
          className={`p-2 w-full rounded ${loading ? "bg-gray-500 text-white cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      {fetchAttempted && semesterData === null && (
        <p className="text-red-500 mt-4">
          No valid data found for this student ID and semester.
        </p>
      )}

      {semesterData && semesterData.semester && (
        <div className="mt-4">
          <div className="mb-4">
            <button
              onClick={() => handleGeneratePDF(true)} // Preview PDF
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-5 mb-5"
            >
              Preview PDF
            </button>

            <button
              onClick={() => handleGeneratePDF()} // Download PDF
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Download PDF
            </button>
          </div>

          
        </div>
      )}
    </div>
  )
}

export default Student
