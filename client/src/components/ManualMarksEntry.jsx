// src/components/ManualMarksEntry.jsx

import React, { useState } from "react"
import axios from "axios"

const ManualMarksEntry = () => {
  const [studentId, setStudentId] = useState("")
  const [semester, setSemester] = useState("")
  const [subjects, setSubjects] = useState([{ subject: "", mark: "" }])
  const [message, setMessage] = useState("")

  const handleSubjectChange = (index, event) => {
    const values = [...subjects]
    values[index][event.target.name] = event.target.value
    setSubjects(values)
  }

  const handleAddSubject = () => {
    setSubjects([...subjects, { subject: "", mark: "" }])
  }

  const handleRemoveSubject = (index) => {
    const values = [...subjects]
    values.splice(index, 1)
    setSubjects(values)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      studentId,
      semester,
      results: subjects.map((subj) => ({
        subject: subj.subject,
        mark: Number(subj.mark),
      })),
    }

    try {
      const response = await axios.post("/api/students/enter-marks", data)
      setMessage(response.data.message)
    } catch (error) {
      setMessage("Error submitting marks. Please try again.")
      console.error(error)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Enter Marks Manually</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="studentId"
            className="block text-sm font-medium text-gray-700"
          >
            Student ID
          </label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter Student ID"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="semester"
            className="block text-sm font-medium text-gray-700"
          >
            Semester
          </label>
          <input
            type="text"
            id="semester"
            name="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter Semester"
            required
          />
        </div>

        {subjects.map((subject, index) => (
          <div key={index} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                name="subject"
                value={subject.subject}
                onChange={(e) => handleSubjectChange(index, e)}
                className="w-2/3 p-2 border border-gray-300 rounded-md"
                placeholder="Subject Name"
                required
              />
              <input
                type="number"
                name="mark"
                value={subject.mark}
                onChange={(e) => handleSubjectChange(index, e)}
                className="w-1/3 p-2 border border-gray-300 rounded-md"
                placeholder="Marks"
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveSubject(index)}
                className="bg-red-500 text-white px-2 py-1 rounded-md"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={handleAddSubject}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Add Subject
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Submit Marks
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-gray-500 mt-4">{message}</p>
        )}
      </form>
    </div>
  )
}

export default ManualMarksEntry
