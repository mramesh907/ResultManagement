import React, { useState } from "react"
import { toast } from "react-hot-toast"
import jsPDF from "jspdf"
import "jspdf-autotable"
import SummaryApi from "../common/SummaryApi.js"

const Student = () => {
  const [studentId, setStudentId] = useState("")
  const [semester, setSemester] = useState("")
  const [semesterData, setSemesterData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  // Function to fetch student data (semester and results)
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

      if (response && response.semester) {
        setSemesterData(response)
        setFetchAttempted(true)
        toast.dismiss()
        toast.success("Data fetched successfully!")
      } else {
        setSemesterData(null)
        setFetchAttempted(true)
        toast.dismiss()
        toast.error("No data found for this student and semester.")
      }
    } catch (error) {
      console.error("Error fetching student data", error)
      setSemesterData(null)
      setFetchAttempted(true)
      toast.dismiss()
      toast.error("No data found for this student and semester.")
    } finally {
      setLoading(false)
      setStudentId("")
      setSemester("")
    }
  }

  // Function to generate PDF using jsPDF
  const generatePDF = () => {
    if (!semesterData) {
      toast.error("No data available to generate PDF.")
      return
    }

    const doc = new jsPDF()
    const marginLeft = 10

    // Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("MIDNAPORE COLLEGE (AUTONOMOUS)", 105, 20, "center")
    doc.setFontSize(12)
    doc.text(
      "Affiliated to Vidyasagar University, Midnapore, West Bengal - 721101",
      105,
      30,
      "center"
    )
    doc.text("AICTE APPROVED", 105, 40, "center")
    doc.line(20, 45, 190, 45)

    // Student Details Section
    let currentY = 60
    doc.setFont("helvetica", "normal")

    // Row 1: Student ID beside Student Name
    doc.text(`Student ID: ${semesterData.studentId || "N/A"}`, 20, currentY)
    doc.text(`Student Name: ${semesterData.name || "N/A"}`, 120, currentY)

    // Row 2: Roll No beside Registration Number
    currentY += 10
    doc.text(`Roll No: ${semesterData.roll || "N/A"}`, 20, currentY)
    doc.text(
      `Registration Number: ${semesterData.registrationNo || "N/A"} of ${semesterData.session || "N/A"}`,
      120,
      currentY
    )

    // Increment currentY to add space for the next section
    currentY += 10

    // Title
    currentY += 20
    doc.setFontSize(16)
    doc.text(
      `Student Results for Semester ${semesterData.semester.semester || "N/A"}`,
      marginLeft,
      currentY
    )

    // // Student Details
    // doc.setFontSize(12)
    // const studentDetails = [
    //   `Student ID: ${semesterData.studentId}`,
    //   `Name: ${semesterData.name}`,
    //   `Roll: ${semesterData.roll}`,
    //   `Registration No: ${semesterData.registrationNo}`,
    //   `Session: ${semesterData.session}`,
    //   `Year: ${semesterData.year}`,
    // ]

    // currentY += 10
    // semesterData.forEach((detail) => {
    //   doc.text(detail, marginLeft, currentY)
    //   currentY += 10
    // })
    // console.log("results", semesterData.semester.results)

    // Results Table
    if (
      semesterData.semester.results &&
      semesterData.semester.results.length > 0
    ) {
      const tableHeaders = ["Subject", "Mark"]
      const tableData = semesterData.semester.results.map((result) => [
        result.subject,
        result.mark,
      ])

      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: currentY + 5,
        margin: { left: marginLeft },
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      })
    } else {
      doc.text("No results available.", marginLeft, currentY + 10)
    }

    // Save PDF
    doc.save(
      `student_${semesterData.studentId}_semester_${semesterData.semester.semester}.pdf`
    )
    toast.success("PDF generated and downloaded!")
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
          className={`p-2 w-full rounded ${
            loading
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
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
          <button
            onClick={generatePDF}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  )
}

export default Student
