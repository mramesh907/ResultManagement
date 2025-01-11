import jsPDF from "jspdf"
import "jspdf-autotable"

// Function to generate the student data PDF
const generatePDF = (semesterData, useCGPA,preview=false) => {
  if (!semesterData) {
    console.error("No data available to generate PDF.")
    return
  }

  const checkAndAddPage = (doc, currentY) => {
    if (currentY > 270) {
      // If the current Y exceeds the page height minus margin
      doc.addPage() // Add a new page
      currentY = 20 // Reset Y position for the new page
    }
    return currentY
  }

  const doc = new jsPDF()
  const marginLeft = 20
  let currentY = 20

  // Add logo to the header
  const logo = new Image()
  logo.src = "/favicon.png" // Replace with your logo path
  doc.addImage(logo, "PNG", marginLeft, currentY, 20, 20)

  // Header Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("MIDNAPORE COLLEGE (AUTONOMOUS)", 105, currentY + 10, "center")
  doc.setFontSize(12)
  doc.text(
    "Affiliated to Vidyasagar University, Midnapore, West Bengal - 721101",
    105,
    currentY + 20,
    "center"
  )
  currentY += 30
  currentY = checkAndAddPage(doc, currentY)
  doc.text("AICTE APPROVED", 105, currentY, "center")
  doc.line(20, currentY + 5, 190, currentY + 5)
  currentY += 15

  // Student Details
  doc.setFont("helvetica", "normal")
  doc.text(
    `Student ID: ${semesterData.studentId || "N/A"}`,
    marginLeft,
    currentY
  )
  doc.text(`Student Name: ${semesterData.name || "N/A"}`, 120, currentY)
  currentY += 10
  doc.text(`Roll No: ${semesterData.roll || "N/A"}`, marginLeft, currentY)
  doc.text(
    `Registration No: ${semesterData.registrationNo || "N/A"} of ${semesterData.session || "N/A"}`,
    120,
    currentY
  )
  currentY += 20

  // Semester Results
  doc.setFontSize(16)
  doc.text(
    `Student Results for Semester ${semesterData.semester.semester || "N/A"}`,
    marginLeft,
    currentY
  )
  currentY += 10

  if (
    semesterData.semester.results &&
    semesterData.semester.results.length > 0
  ) {
    const tableHeaders = [
      "Paper",
      "Max Marks",
      "Marks Obtained",
      "Grade",
      "Grade Points",
      "Credit",
      "Credit Points",
    ]
    const tableData = semesterData.semester.results.map((result) => {
      const percentage = (result.mark / 100) * 100
      let grade, gradePoints

      if (percentage >= 90) {
        grade = "O"
        gradePoints = 10
      } else if (percentage >= 80) {
        grade = "A+"
        gradePoints = 9
      } else if (percentage >= 70) {
        grade = "A"
        gradePoints = 8
      } else if (percentage >= 60) {
        grade = "B+"
        gradePoints = 7
      } else if (percentage >= 50) {
        grade = "B"
        gradePoints = 6
      } else if (percentage >= 40) {
        grade = "C"
        gradePoints = 5
      } else if (percentage >= 30) {
        grade = "P"
        gradePoints = 4
      } else {
        grade = "F"
        gradePoints = 0
      }
      const creditPoint = (result.credit || 0) * gradePoints
      let course, subject, type, maxmarks
      if (result.subject === "C++") {
        course = "DSC"
        subject = "BCA"
        type = "Th"
        maxmarks = 50
        console.log(course, subject, type, maxmarks)
      }
      return [
        result.subject || "N/A",
        "100",
        result.mark || "N/A",
        grade,
        gradePoints,
        result.credit || "N/A",
        creditPoint.toFixed(2),
      ]
    })

    // Add totals
    const totalCredits = semesterData.semester.results.reduce(
      (sum, row) => sum + (row.credit || 0),
      0
    )
    const totalCreditPoints = semesterData.semester.results.reduce(
      (sum, row) => sum + (row.credit || 0) * ((row.mark / 100) * 10 || 0),
      0
    )
    const sgpa =
      totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : "N/A"
    const totalMarksObtained = semesterData.semester.results.reduce(
      (sum, row) => sum + (parseInt(row.mark) || 0),
      0
    )
    const totalFullMarks = semesterData.semester.results.length * 100
    const percentage = (totalMarksObtained / totalFullMarks) * 100
    let resultRemark = "Not Qualified"
    let resultClass = "Fail"

    if (percentage >= 50) {
      resultRemark = "Qualified to the Next Semester"
      resultClass = percentage >= 60 ? "First Class" : "Second Class"
    }

    tableData.push([
      "Total",
      totalFullMarks,
      totalMarksObtained,
      "",
      "",
      totalCredits,
      totalCreditPoints.toFixed(2),
    ])

    currentY = checkAndAddPage(doc, currentY)
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: currentY,
      theme: "grid",
      margin: { left: marginLeft },
      styles: {
        fontSize: 12,
        lineWidth: 0.5, // Border width
        lineColor: [0, 0, 0], // Border color (black)
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        lineWidth: 1, // Thicker border for headers
      },
      bodyStyles: {
        fontStyle: "normal", // Normal font for body text
        textColor: [0, 0, 0],
      },
      willDrawCell: (data) => {
        const { section, column, cell } = data

        // Draw vertical borders between header columns, excluding the first and last column
        if (section === "head") {
          const x = cell.x + cell.width // Right edge of the header cell
          const yStart = cell.y // Top of the header cell
          const yEnd = cell.y + cell.height // Bottom of the header cell

          // Draw border only if the current column is not the first or last one
          if (
            column.index !== 0 &&
            column.index !== data.table.columns.length
          ) {
            doc.setLineWidth(0.5) // Border thickness
            doc.setDrawColor(255, 255, 255) // White color for the line
            doc.line(x, yStart, x, yEnd) // Draw the vertical line
          }
        }
      },
    })

    currentY = doc.lastAutoTable.finalY + 10
    currentY = checkAndAddPage(doc, currentY)

    // Summary below table
    const leftColumnX = marginLeft
    const rightColumnX = 120
    const rowHeight = 10

    // Row 1: Credit, Grand Total Credit Points, and SGPA
    doc.text(
      `Grand Total Credit Points: ${totalCredits}`,
      leftColumnX,
      currentY
    )
    doc.text(
      `SGPA: ${totalCreditPoints.toFixed(2)}`,
      leftColumnX,
      currentY + rowHeight
    )
    doc.text(`Credit Points: ${sgpa}`, rightColumnX, currentY)
    const cgpa = useCGPA || "N/A"
    doc.text(`CGPA: ${cgpa}`, rightColumnX, currentY + rowHeight)
    currentY += 2 * rowHeight

    // Row 2: Grand Total Marks and Total Marks Obtained
    doc.text(`Grand Total Marks: ${totalFullMarks}`, leftColumnX, currentY)
    doc.text(
      `Total Marks Obtained: ${totalMarksObtained}`,
      rightColumnX,
      currentY
    )
    currentY += rowHeight
    currentY=checkAndAddPage(doc, currentY)
    // Row 3: Percentage and Result
    doc.text(`Percentage: ${percentage.toFixed(2)}%`, leftColumnX, currentY)
    doc.text(`Result: ${resultClass}`, rightColumnX, currentY)
    currentY += rowHeight

    // Row 4: Remarks
    doc.text(`Remarks: ${resultRemark}`, leftColumnX, currentY)

    currentY += 20
    const currentDate = new Date().toLocaleDateString("en-GB") // Format: DD/MM/YYYY
    doc.text(`Published On: ${currentDate}`, marginLeft, currentY)
    currentY += 20
    doc.setFontSize(12)
    currentY = checkAndAddPage(doc, currentY)

    // Footer Section
    doc.text("Verified by:", marginLeft, currentY)

    doc.text("Controller of Examinations", marginLeft, currentY + 20)
    currentY = checkAndAddPage(doc, currentY)

    doc.text("Teacher-in-Charge", 140, currentY)
     doc.text("Chief Controller of Examinations", 140, currentY+20)
   

     if (preview) {
       const pdfBlob = doc.output("blob") // Generate a Blob
       const pdfURL = URL.createObjectURL(pdfBlob) // Create a URL for the Blob
       window.open(pdfURL) // Open in a new tab
     } else {
       // Download the PDF directly
       doc.save(
         `student_${semesterData.studentId}_semester_${semesterData.semester.semester}.pdf`
       )
     }
  }
}
export default generatePDF
