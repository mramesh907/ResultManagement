import React, { useState, useEffect } from "react"
import generatePDF from "../utils/generatePDF.js" // Import your PDF generation function
import ConfirmModal from "./ConfirmBox.jsx"
import SummaryApi from "../common/SummaryApi"
import toast from "react-hot-toast"

const SemesterStudentList = () => {
  const [semester, setSemester] = useState("")
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [semesterData, setSemesterData] = useState(null)
  const [gpa, setGPA] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null) // Track the selected student
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, studentId: null })

  const fetchStudentData = async (studentId, semester) => {
    try {
      const response = await SummaryApi.fetchStudentDetails(studentId, semester)
      const gparesponse = await SummaryApi.calculateGPA(studentId)
      if (response && response.semester && gparesponse) {
        setSemesterData(response)
        setGPA(gparesponse)
        toast.success("Data fetched successfully!")
      }
    } catch (error) {
      setSemesterData(null)
      setGPA(null)
      toast.dismiss()
      if (error.response && error.response.status === 404) {
        toast.error("No data found for this student and semester.")
      } else {
        toast.error("Error fetching data. Please try again later.")
      }
    }
  }

  // Fetch students for the selected semester
  const fetchStudents = async (semester) => {
    setLoading(true)
    setError("")
    try {
      const response = await SummaryApi.fetchStudentBySemester(semester)
      setStudents(response)
    } catch (err) {
      setError("Failed to fetch students. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSemesterChange = (e) => {
    const selectedSemester = e.target.value
    setSemester(selectedSemester)
    if (selectedSemester) {
      fetchStudents(selectedSemester)
    } else {
      setStudents([])
    }
  }

  const handleGeneratePDF = async (studentId, semester, preview = false) => {
    setSelectedStudent({ studentId, semester })
  }

  const handleDeleteStudent = async () => {
    if (!confirmModal.studentId) return

    try {
      await SummaryApi.deleteStudent(confirmModal.studentId)
      toast.success("Student deleted successfully!")
      setStudents((prevStudents) =>
        prevStudents.filter(
          (student) => student.studentId !== confirmModal.studentId
        )
      )
    } catch (error) {
      toast.error("Failed to delete student. Please try again.")
    } finally {
      setConfirmModal({ isOpen: false, studentId: null }) // Close modal
    }
  }

  // Generate PDF when semesterData and GPA are available
  useEffect(() => {
    if (selectedStudent) {
      const { studentId, semester } = selectedStudent
      fetchStudentData(studentId, semester)
    }
  }, [selectedStudent])

  // Trigger PDF generation when data is ready
  useEffect(() => {
    if (semesterData && gpa) {
      generatePDF(semesterData, gpa, true)
    }
  }, [semesterData, gpa])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-lg hover:shadow-2xl rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">
          Semester Student List
        </h1>
        <div className="flex items-center gap-4 mb-6">
          <label htmlFor="semester" className="text-gray-600 font-medium ">
            Select Semester:
          </label>
          <select
            id="semester"
            value={semester}
            onChange={handleSemesterChange}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer"
          >
            <option value="">-- Select Semester --</option>
            {[...Array(8).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-blue-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          students.length > 0 && (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="px-4 py-2 border border-gray-300">#</th>
                  <th className="px-4 py-2 border border-gray-300">
                    Student ID
                  </th>
                  <th className="px-4 py-2 border border-gray-300">Name</th>
                  <th className="px-4 py-2 border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.studentId}
                    className="odd:bg-gray-100 even:bg-white"
                  >
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {student.name}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center flex justify-center gap-3">
                      <button
                        onClick={() =>
                          handleGeneratePDF(student.studentId, semester, true)
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            studentId: student.studentId,
                          })
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {students.length === 0 && semester && !loading && !error && (
          <div className="text-center text-gray-500">
            No students found for Semester {semester}.
          </div>
        )}
      </div>
      {/* Confirm Modal Component */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, studentId: null })}
        onConfirm={handleDeleteStudent}
        message="Are you sure you want to delete this student?"
      />
    </div>
  )
}

export default SemesterStudentList
