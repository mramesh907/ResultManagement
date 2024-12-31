import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi" // Import the SummaryApi

const Admin = () => {
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



  const handleFileChange = (e) => {
    setFile(e.target.files[0])
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

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }
    // Set uploading to true when the upload starts
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await SummaryApi.resultsUpload(formData)
      if (response.status === 200) {
        // Destructure the response data to get the message and counts
        const { message, newStudents, updatedStudents } = response.data

        // Display success message
        toast.success(message)

        // Optionally, display the number of new and updated students
        setResponseDetails({
          message,
          newStudents,
          updatedStudents,
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Error uploading file")
    } finally {
      // Set uploading to false after the process is complete
      setUploading(false)
    }
  }

  const checkStudentExistence = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter a valid Student ID")
      return
    }

    try {
      const response = await SummaryApi.checkStudentExist(studentId) // API to check student existence
      if (response.exists) {
        setStudentExists(true)
        toast.success("Student found!")
      }
    } catch (error) {
      setStudentExists(false)
      toast.error("Student does not exist in the system.")
    }
  }

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
      await SummaryApi.updateStudentResults(studentId, semester, marksData) // Send marksData as-is
      toast.success("Marks added successfully!")
      // Reset the fields to initial state after successful submission
      setStudentId("")
      setSemester("")
      setMarks({})
      setSubject("")
      setStudentExists(null) // Reset student existence state
    } catch (error) {
      toast.error("Error submitting marks")
    }
  }
  return (
    <div className="p-6">
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
        {/* Display response details */}
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

        {/* Show form only if the student exists */}
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
            Student does not exist. Please verify the Student ID.
          </p>
        )}
      </div>
    </div>
  )
}

export default Admin
