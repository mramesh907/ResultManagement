import React, { useState } from "react"
import SummaryApi from "../common/SummaryApi.js"
import { toast } from "react-hot-toast"

const ManualMarksEntry = () => {
  const [semester, setSemester] = useState("")
  const [isSemesterLocked, setIsSemesterLocked] = useState(false)
  const [subject, setSubject] = useState("")
  const [credit, setCredit] = useState("")
  const [course, setCourse] = useState("")
  const [paper, setPaper] = useState("")
  const [type, setType] = useState("")
  const [ciaMarks, setCiaMarks] = useState("")
  const [eseMarks, setEseMarks] = useState("")
  const [papers, setPapers] = useState([])
  const [students, setStudents] = useState([])
  const [step, setStep] = useState(1)
const [showPopup, setShowPopup] = useState(false)
const [studentDetails, setStudentDetails] = useState({
  studentId: "",
  name: "",
  roll: "",
  no: "",
  registrationNo: "",
  session: "",
  year: "",
  semester: "",
})
const handleInputChange = (e) => {
  const { name, value } = e.target
  setStudentDetails((prev) => ({
    ...prev,
    [name]: value,
  }))
}


  const handleAddStudent = async () => {
    try {
      const response = await SummaryApi.addStudentWithDynamicSemester(
        studentDetails
      )

      if (response.success) {
        toast.success("Student added successfully!")
        setShowPopup(false) // Close the popup after success
        setStudentDetails({
          studentId: "",
          name: "",
          roll: "",
          no: "",
          registrationNo: "",
          session: "",
          year: "",
          semester: "",
        })
      } else if (response.error === "Student with this ID already exists.") {
        toast.error("Student already exists!")
        console.log("Existing student data:", response.data) // Optional: log existing student details
      } else {
        toast.error(response.error || "Failed to add student.")
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "An unexpected error occurred while adding the student."
      )
    }
  }


  // Add paper details to the list
  const addPaper = () => {
    if (
      !subject ||
      !credit ||
      !course ||
      !paper ||
      !type ||
      !ciaMarks ||
      !eseMarks
    ) {
      toast.error("All paper fields are required.")
      return
    }
    setPapers((prev) => [
      ...prev,
      {
        subject,
        credit: Number(credit),
        course,
        paper,
        type,
        ciaMarks: Number(ciaMarks),
        eseMarks: Number(eseMarks),
      },
    ])
    // Lock the semester after the first addition if needed
    if (!isSemesterLocked) {
      setIsSemesterLocked(true)
    }
    // Reset fields
    setSubject("")
    setCredit("")
    setCourse("")
    setPaper("")
    setType("")
    setCiaMarks("")
    setEseMarks("")
  }

  // Proceed to the next step
  const fetchStudents = async () => {
    if (!semester || papers.length === 0) {
      toast.error("Semester and at least one paper are required.")
      return
    }
    try {
      const response = await SummaryApi.fetchStudentBySemester(semester)
      // response.map((student) => {
      //   console.log(student);
      // })
      setStudents(
        response.map((student) => ({
          ...student,
          marks: papers.map((paper) => ({
            paperName: paper.paper,
            ciaMarks: "",
            eseMarks: "",
          })),
        }))
      )
      setStep(2)
    } catch (err) {
      console.log(err)
      toast.error("Failed to fetch students. Please check the semester.")
    }
  }

  // Update marks for a student
  const updateMarks = (studentId, paperIndex, type, value) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.studentId === studentId
          ? {
              ...student,
              marks: student.marks.map((mark, index) =>
                index === paperIndex ? { ...mark, [type]: value } : mark
              ),
            }
          : student
      )
    )
  }

  // Final submission
  const handleSubmit = async () => {
    try {
      const data = {
        semester,
        papers,
        students,
      }
      
      await SummaryApi.submitMarks(data)
      toast.success("Marks updated successfully!")
      // Reset state
      setSemester("")
      setPapers([])
      setStudents([])
      setStep(1)
    } catch (err) {
      console.log(err)
      toast.error("Failed to update marks. Please try again.")
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent default Enter behavior

      // Get all input elements within the parent container (e.g., tbody or table)
      const inputs = Array.from(document.querySelectorAll("input"))
      const index = inputs.indexOf(e.target) // Find the current input's index

      // Focus the next input if it exists
      if (index !== -1 && inputs[index + 1]) {
        inputs[index + 1].focus()
      }
    }
  }



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {step === 1 && (
        <>
          {/* Add Student Button */}
          <button
            onClick={() => setShowPopup(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
          >
            Add Student
          </button>

          {/* Popup Form */}
          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full md:w-1/2 lg:w-1/3 border-2 border-gray-300 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
                  Add New Student
                </h2>
                <div className="space-y-6">
                  {[
                    { name: "studentId", label: "Student ID" },
                    { name: "name", label: "Name" },
                    { name: "roll", label: "Roll" },
                    { name: "no", label: "No" },
                    { name: "registrationNo", label: "Registration No" },
                    { name: "session", label: "Session" },
                    { name: "year", label: "Year" },
                    { name: "semester", label: "Semester" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={studentDetails[field.name]}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label}`}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddStudent}
                    className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-center mb-4">
            Paper Details
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Semester"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              disabled={isSemesterLocked} // Disable if locked
              required
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
            <input
              type="text"
              value={credit}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  // Only allow digits
                  setCredit(e.target.value)
                }
              }}
              placeholder="Credit"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
            <input
              type="text"
              value={paper}
              onChange={(e) => setPaper(e.target.value)}
              placeholder="Paper"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
            <input
              type="text"
              value={ciaMarks}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  // Only allow digits
                  setCiaMarks(e.target.value)
                }
              }}
              placeholder="CIA Marks"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
            <input
              type="text"
              value={eseMarks}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  // Only allow digits
                  setEseMarks(e.target.value)
                }
              }}
              placeholder="ESE Marks"
              className="p-2 border rounded"
              onKeyDown={(e) => handleKeyDown(e)}
              required
            />
          </div>
          <button
            onClick={addPaper}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Paper
          </button>
          <button
            onClick={fetchStudents}
            className="bg-green-500 text-white px-4 py-2 rounded ml-4"
          >
            Next
          </button>
          <ul className="mt-4">
            {papers.map((paper, index) => (
              <li key={index}>
                {paper.paper} - {paper.course} ({paper.type})
              </li>
            ))}
          </ul>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-2xl font-semibold text-center mb-4">
            Student Marks
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1" rowSpan="2">
                    Student ID
                  </th>
                  <th className="border px-2 py-1" rowSpan="2">
                    Name
                  </th>
                  {papers.map((paper, index) => (
                    <React.Fragment key={index}>
                      <th colSpan="2" className="border px-2 py-1">
                        {paper.paper} ({paper.type})
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  {papers.map((paper, index) => (
                    <React.Fragment key={index}>
                      <th className="border px-2 py-1">CIA</th>
                      <th className="border px-2 py-1">ESE</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.studentId}>
                    <td className="border px-2 py-1">{student.studentId}</td>
                    <td className="border px-2 py-1">{student.name}</td>
                    {student.marks.map((mark, index) => (
                      <React.Fragment key={index}>
                        {/* Input for CIA Marks */}
                        <td className="border px-2 py-1">
                          <input
                            type="text"
                            value={mark.ciaMarks}
                            onChange={(e) =>
                              updateMarks(
                                student.studentId,
                                index,
                                "ciaMarks",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(e)}
                            placeholder="CIA"
                            className="p-1 border rounded w-full"
                          />
                        </td>
                        {/* Input for ESE Marks */}
                        <td className="border px-2 py-1">
                          <input
                            type="text"
                            value={mark.eseMarks}
                            onChange={(e) =>
                              updateMarks(
                                student.studentId,
                                index,
                                "eseMarks",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(e)}
                            placeholder="ESE"
                            className="p-1 border rounded w-full"
                          />
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full sm:w-auto"
          >
            Submit Marks
          </button>
        </>
      )}
    </div>
  )
}

export default ManualMarksEntry

