import jsPDF from "jspdf"
import "jspdf-autotable"

const generatePDF = (semesterData) => {
  if (!semesterData) {
    console.error("No data available to generate PDF.")
    return
  }

  const doc = new jsPDF()
  const marginLeft = 10
  let currentY = 20 // Start at the top of the page

  // Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("MIDNAPORE COLLEGE (AUTONOMOUS)", 105, currentY, "center")
  doc.setFontSize(12)
  currentY += 10
  doc.text(
    "Affiliated to Vidyasagar University, Midnapore, West Bengal - 721101",
    105,
    currentY,
    "center"
  )
  currentY += 10
  doc.text("AICTE APPROVED", 105, currentY, "center")
  doc.line(20, currentY + 5, 190, currentY + 5)
  currentY += 10

  // Student Details Section
  doc.setFont("helvetica", "normal")

  // Row 1: Student ID beside Student Name
  doc.text(`Student ID: ${semesterData.studentId || "N/A"}`, 20, currentY)
  doc.text(`Student Name: ${semesterData.name || "N/A"}`, 120, currentY)

  // Row 2: Roll No beside Registration Number
  currentY += 10
  doc.text(`Roll No: ${semesterData.roll || "N/A"}`, 20, currentY)
  doc.text(
    `Registration Number: ${semesterData.registrationNo || "N/A"} of ${
      semesterData.session || "N/A"
    }`,
    120,
    currentY
  )

  // Increment currentY to add space for the next section
  currentY += 20

  // Title
  doc.setFontSize(16)
  doc.text(
    `Student Results for Semester ${semesterData.semester.semester || "N/A"}`,
    marginLeft,
    currentY
  )

  // Results Table with Borders
  if (
    semesterData.semester.results &&
    semesterData.semester.results.length > 0
  ) {
    const tableHeaders = ["Subject", "Full Marks", "Marks Obtained"]
    const columnWidths = [60, 40, 40]
    const tableStartX = 20
    const tableStartY = currentY + 10
    const rowHeight = 10

    // Draw Table Header with Borders
    doc.setFont("helvetica", "bold")
    tableHeaders.forEach((header, index) => {
      const x =
        tableStartX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0)
      doc.text(header, x + 5, tableStartY + 7)
      doc.rect(x, tableStartY, columnWidths[index], rowHeight)
    })

    currentY = currentY + rowHeight

    // Draw Table Rows with Borders
    doc.setFont("helvetica", "normal")
    let totalMarksObtained = 0
    let totalFullMarks = 0
    semesterData.semester.results.forEach((row) => {
      const rowData = [
        row.subject || "N/A",
        "100", // Full Marks for each subject
        row.mark || "N/A",
      ]

      rowData.forEach((data, index) => {
        const x =
          tableStartX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0)
        doc.text(data, x + 5, currentY + 7)
        doc.rect(x, currentY, columnWidths[index], rowHeight)
      })

      totalMarksObtained += parseInt(row.mark) || 0
      totalFullMarks += 100 // Since Full Marks for each subject is 100
      currentY += rowHeight

      // Check if the content exceeds page size
      if (currentY > 250) {
        doc.addPage()
        currentY = 20 // Reset Y for the new page
      }
    })

    // Display Total Marks Below the Table
    currentY += 10 // Add space before the totals
    doc.text(`Total Full Marks: ${totalFullMarks}`, tableStartX, currentY)
    currentY += 10
    doc.text(
      `Total Marks Obtained: ${totalMarksObtained}`,
      tableStartX,
      currentY
    )
  } else {
    currentY += 10 // Add space before the message
    doc.text("No results available.", marginLeft, currentY)
  }

  // Ensure there's space for the footer
  if (currentY > 230) {
    doc.addPage()
    currentY = 20 // Reset currentY for the new page
  }

  // Footer Section
  currentY += 20 // Add space before the footer
  doc.setFontSize(12)
  doc.text("Remark: Qualified to the Next Semester", 20, currentY)
  currentY += 10
  doc.text("Published On: 01/10/2023", 20, currentY)
  currentY += 20

  doc.setFontSize(10)
  doc.text("Verified by:", 50, currentY)
  doc.text("Teacher-in-Charge", 150, currentY)
  currentY += 10
  doc.text("Controller of Examinations", 40, currentY)
  doc.text("Chief Controller of Examinations", 140, currentY)

  // Save PDF
  doc.save(
    `student_${semesterData.studentId}_semester_${semesterData.semester.semester}.pdf`
  )
  // You can add a success message or notification here
}

export default generatePDF
