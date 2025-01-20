import React, { useState } from "react"
import SummaryApi from "../common/SummaryApi.js"
import { toast } from "react-hot-toast"

const ManualMarksEntry = () => {
  const [semester, setSemester] = useState("")
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
      console.log('data', data);
      
      await SummaryApi.submitMarks(data)
      toast.success("Marks updated successfully!")
      // Reset state
      setSemester("")
      setPapers([])
      setStudents([])
      setStep(1)
    } catch (err) {
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
              required
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder="Credit"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={paper}
              onChange={(e) => setPaper(e.target.value)}
              placeholder="Paper"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={ciaMarks}
              onChange={(e) => setCiaMarks(e.target.value)}
              placeholder="CIA Marks"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={eseMarks}
              onChange={(e) => setEseMarks(e.target.value)}
              placeholder="ESE Marks"
              className="p-2 border rounded"
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
          <table className="w-full border">
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
                          className="p-1 border rounded"
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
                          className="p-1 border rounded"
                        />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            Submit Marks
          </button>
        </>
      )}
    </div>
  )
}

export default ManualMarksEntry

