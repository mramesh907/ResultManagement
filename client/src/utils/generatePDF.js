import jsPDF from "jspdf"
import "jspdf-autotable"
// Function to generate the student data PDF
const generatePDF = (semesterData, gpa, preview = false) => {
  // console.log(gpa)

  if (!semesterData) {
    console.error("No data available to generate PDF.")
    return
  }

  const checkAndAddPage = (doc, currentY) => {
    if (currentY > 270) {
      doc.addPage() // Add a new page
      currentY = 20 // Reset Y position
    }
    return currentY
  }

  const doc = new jsPDF()
  const marginLeft = 10
  let currentY = 10

  // Add logo to the header
  const logo = new Image()
  logo.src = "/Midnapore_College.png" // Replace with your logo path
  doc.addImage(logo, "PNG", marginLeft, currentY, 20, 20)

  // Header Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  // doc.setTextColor(4, 10, 61)
  doc.setTextColor(0, 0, 128)
  doc.text("MIDNAPORE COLLEGE (AUTONOMOUS)", 105, currentY + 10, "center")
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setTextColor(4, 10, 61) // Deep dark blue color

  doc.text(
    "Affiliated to Vidyasagar University, Midnapore, West Bengal - 721101",
    105,
    currentY + 15,
    "center"
  )
  doc.text("Statement of Marks/Grade", 105, currentY + 20, "center")
  doc.setFontSize(12)
  doc.text(
    `End Semester Examination of Semester: ${
      semesterData.semester.semester || "N/A"
    }`,
    105,
    currentY + 25,
    "center"
  )

  // semesterData.semester.semester
  doc.text(`B.C.A with Single Major Subject`, 105, currentY + 30, "center")
  doc.text(
    `[ 4-Year Under Graduation Programme(CCFUP-NEP) ]`,
    105,
    currentY + 35,
    "center"
  )
  currentY += 30
  currentY = checkAndAddPage(doc, currentY)
  doc.text("AICTE APPROVED", 105, currentY + 10, "center")
  doc.line(20, currentY + 10, 190, currentY + 12)
  currentY += 17
  doc.setTextColor(0, 0, 0) // Deep dark blue color
  // Student Details
  doc.setFont("helvetica", "normal")
  doc.text(
    `Student ID: ${semesterData.studentId || "N/A"}`,
    marginLeft,
    currentY
  )
  doc.text(`Student Name: ${semesterData.name || "N/A"}`, 120, currentY)
  currentY += 10
  doc.text(`Roll: ${semesterData.roll || "N/A"}`, marginLeft, currentY)
  doc.text(
    `Registration No: ${semesterData.registrationNo || "N/A"} of ${semesterData.session || "N/A"}`,
    marginLeft,
    currentY + 10
  )

  doc.text(`No: ${semesterData.no || "N/A"}`, 120, currentY)
  doc.text(`Course: BCA`, 120, currentY + 10)
  currentY += 20

  // Table Data Preparation
  const tableHeaders = [
    "Course",
    "Subject",
    "Paper",
    "Th/Pr/Proj",
    "Max Marks",
    "Marks Obtained",
    "Grade",
    "Grade Points",
    "Credit",
    "Credit Points",
  ]

  const tableData = []
  // let gradePointsArray = []

  semesterData.semester.results.forEach((result) => {
    result.types.forEach((type) => {
      const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
      const marksObtained =
        (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
      const percentage = (marksObtained / maxMarks) * 100

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
      const creditPoints = (type.credit || 0) * gradePoints

      tableData.push([
        result.course || "N/A",
        result.subject || "N/A",
        result.paper || "N/A",
        type.type || "N/A",
        maxMarks,
        marksObtained,
        grade,
        gradePoints,
        type.credit || "N/A",
        creditPoints,
      ])
    })
  })

  // Calculate Totals
  const totalCredits = semesterData.semester.results.reduce(
    (sum, row) =>
      sum + row.types.reduce((subSum, type) => subSum + (type.credit || 0), 0),
    0
  )

  const totalCreditPoints = semesterData.semester.results.reduce((sum, row) => {
    return (
      sum +
      row.types.reduce((subSum, type) => {
        const maxMarks = (type.ciaMarks || 0) + (type.eseMarks || 0)
        const marksObtained =
          (type.ciamarksObtained || 0) + (type.esemarksObtained || 0)
        const percentage = (marksObtained / maxMarks) * 100

        let gradePoints
        if (percentage >= 90) {
          gradePoints = 10
        } else if (percentage >= 80) {
          gradePoints = 9
        } else if (percentage >= 70) {
          gradePoints = 8
        } else if (percentage >= 60) {
          gradePoints = 7
        } else if (percentage >= 50) {
          gradePoints = 6
        } else if (percentage >= 40) {
          gradePoints = 5
        } else if (percentage >= 30) {
          gradePoints = 4
        } else {
          gradePoints = 0
        }

        const creditPoints = (type.credit || 0) * gradePoints
        return subSum + creditPoints
      }, 0)
    )
  }, 0)

  const sgpa =
    totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : "N/A"

  const totalMarksObtained = semesterData.semester.results.reduce(
    (sum, row) =>
      sum +
      row.types.reduce(
        (subSum, type) =>
          subSum + (type.ciamarksObtained || 0) + (type.esemarksObtained || 0),
        0
      ),
    0
  )
  const totalFullMarks = semesterData.semester.results.reduce(
    (sum, row) =>
      sum +
      row.types.reduce(
        (subSum, type) => subSum + (type.ciaMarks || 0) + (type.eseMarks || 0),
        0
      ),
    0
  )
  const percentage = (totalMarksObtained / totalFullMarks) * 100

  let resultRemark = "Not Qualified"
  let resultClass = "Fail"
  if (percentage >= 50) {
    resultRemark = "Qualified to the Next Semester"
    resultClass = percentage >= 60 ? "First Class" : "Second Class"
  }

  // Add Totals to Table
  tableData.push([
    "Total",
    "",
    "",
    "",
    totalFullMarks,
    totalMarksObtained,
    "",
    "",
    totalCredits,
    totalCreditPoints.toFixed(2),
  ])

  // Add Table to PDF
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
    }, // Decreased font size of headers
    headStyles: {
      fontSize: 10,
      fillColor: [26, 189, 156],
      textColor: [255, 255, 255],
      lineWidth: 0.5, // Thicker border for headers
    },
    bodyStyles: {
      fontStyle: "normal", // Normal font for body text
      textColor: [0, 0, 0],
    },
    // willDrawCell: (data) => {
    //   const { section, column, cell } = data

    //   // Draw vertical borders between header columns, excluding the first and last column
    //   if (section === "head") {
    //     const x = cell.x + cell.width // Right edge of the header cell
    //     const yStart = cell.y // Top of the header cell
    //     const yEnd = cell.y + cell.height // Bottom of the header cell

    //     // Draw border only if the current column is not the first or last one
    //     if (column.index !== 0) {
    //       doc.setLineWidth(0.5) // Border thickness
    //       doc.setDrawColor(255, 255, 255) // White color for the line
    //       doc.line(x, yStart, x, yEnd) // Draw the vertical line
    //     }
    //   }
    // },
  })

  currentY = doc.lastAutoTable.finalY + 10

  // Summary Below the Table
  const rightColumnX = 120
  const rowHeight = 10

  // Adjusted Text Alignment
  doc.text(`Grand Total Credit Points: ${totalCredits}`, marginLeft, currentY)
  doc.text(`SGPA: ${sgpa}`, marginLeft, currentY + rowHeight)
  doc.text(
    `Credit Points: ${totalCreditPoints.toFixed(2)}`,
    rightColumnX,
    currentY
  )
  // const cgpa = useCGPA || "N/A"
  // doc.text(`CGPA: ${cgpa}`, rightColumnX, currentY + rowHeight)
  // currentY += 2 * rowHeight

  // Corrected text alignment for specific sections

  let cgpaforsem
  const summaryData = gpa.semesters
    // .filter((result) => result.semester <= semesterData.semester.semester) // Filter semesters based on the current semester
    .map((result) => {
      if (result.semester === semesterData.semester.semester) {
        cgpaforsem = result.cgpa
      }
      // Get the YGPA for the corresponding year
      let ygpa = "N/A"
      const yearIndex = Math.floor((result.semester - 1) / 2) // Assuming semesters 1-2 are Year 1, 3-4 are Year 2, etc.

      if (yearIndex < gpa.ygpa.length) {
        ygpa = gpa.ygpa[yearIndex].ygpa || "N/A"
      }
      return [
        result.semester || "N/A",
        result.sgpa || "N/A",
        result.cgpa || "N/A",
        ygpa || "N/A",
        result.totalCredits || "N/A",
        result.totalCreditPoints || "N/A",
        result.maxMarks || "N/A",
        result.totalMarks || "N/A",
        result.percentageObtained
          ? result.percentageObtained.toFixed(2)
          : "N/A",
      ]
    })

  doc.text(
    `Grand Total Marks: ${totalFullMarks}`,
    marginLeft,
    currentY + rowHeight + 10
  )
  doc.text(`CGPA: ${cgpaforsem}`, rightColumnX, currentY + rowHeight)
  doc.text(
    `Total Marks Obtained: ${totalMarksObtained}`,
    rightColumnX,
    currentY + rowHeight + 10
  )
  currentY += 2 * rowHeight // Increased to account for extra spacing

  currentY = checkAndAddPage(doc, currentY)

  doc.text(`Percentage: ${percentage.toFixed(2)}%`, marginLeft, currentY + 10)
  doc.text(`Result: ${resultClass}`, rightColumnX, currentY + 10)
  currentY += rowHeight

  doc.text(`Remarks: ${resultRemark}`, marginLeft, currentY + 10)
  currentY += 20

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  // Summary Table:- Add below the main result table and above the footer
  const summaryHeaders = [
    "Semester",
    "SGPA",
    "CGPA",
    "YGPA",
    "Total Credit",
    "Total Credit Points",
    "Max Marks",
    "Total Marks",
    "Percentage Obtained",
  ]

  // Add Summary Table to PDF
  currentY = checkAndAddPage(doc, currentY)
  doc.setFontSize(14)
  currentY += 4

  doc.text("Summary", marginLeft, currentY)
  currentY += 4
  currentY = checkAndAddPage(doc, currentY)

  doc.autoTable({
    head: [summaryHeaders],
    body: summaryData,
    startY: currentY,
    theme: "grid",
    margin: { left: marginLeft },
    styles: {
      fontSize: 12,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fontSize: 10,
      fillColor: [26, 189, 156],
      textColor: [255, 255, 255],
      lineWidth: 0.5,
    },
    bodyStyles: {
      fontStyle: "normal",
      textColor: [0, 0, 0],
    },
  })

  // Footer: After the table, adjust currentY
  currentY = doc.lastAutoTable.finalY + 10 // Adjust space after the table

  // Align footer text
  doc.setFontSize(10)
  // doc.text(`Result Published Date: ${currentDate}`, marginLeft, currentY)
  // doc.text(`Date of Printing: ${currentDate}`, rightColumnX, currentY)
  doc.text(`Date of Printing: ${currentDate}`, marginLeft, currentY)
  currentY = checkAndAddPage(doc, currentY)

  // Adding Verified by details
  currentY += 20
  currentY = checkAndAddPage(doc, currentY)

  doc.text("Verified by:", marginLeft, currentY)
  const signatureImage = new Image()
  signatureImage.src = "/signature2.png" // Path to the signature image
  doc.addImage(signatureImage, "PNG", marginLeft + 20, currentY - 15, 20, 20) // Adjust the position and size

  // doc.text("Controller of Examinations", marginLeft, currentY + 10)

  // Check and add page if necessary
  currentY = checkAndAddPage(doc, currentY)
  doc.addImage(signatureImage, "PNG", 140, currentY - 20, 20, 20)
  doc.text("Teacher-in-Charge", 140, currentY)
  doc.text("Chief Controller of Examinations", 140, currentY + 10)
  if (preview) {
    window.open(doc.output("bloburl"))
  } else {
    doc.save(
      `${semesterData.name}_semester_${semesterData.semester.semester}_result.pdf`
    )
  }
}

export default generatePDF

// All data comes dynamically correct. just align the texts. in 'Summary Below the Table' ,'Footer' and 'Adding Verified by details' section texts. in proper positions even when new page added
