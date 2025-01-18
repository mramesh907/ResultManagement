import React, { useState } from "react"
import axios from "axios"
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
  const [students, setStudents] = useState([])
  const [studentData, setStudentData] = useState({
    studentId: "",
    ciamarksObtained: "",
    esemarksObtained: "",
  })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [newStudentData, setNewStudentData] = useState({
     studentId: "",
     name: "",
     roll: "",
     no: "",
     registrationNo: "",
     session: "",
     year: "2024",
     semesters: [
       {
         semester: "1", // default value
         results: [],
       },
     ],
   })
  const handleStudentChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value,
    })
  }

  // Add student marks to the list
  const addStudentMarks = () => {
    if (
      !studentData.studentId ||
      !studentData.ciamarksObtained ||
      !studentData.esemarksObtained
    ) {
      setError("All student data (ID, CIA marks, ESE marks) is required.")
      return
    }

    setStudents([...students, studentData])
    setStudentData({
      studentId: "",
      ciamarksObtained: "",
      esemarksObtained: "",
    })
    setError("")
  }

  // Remove a student from the list
  const removeStudent = (index) => {
    const newStudents = students.filter((_, i) => i !== index)
    setStudents(newStudents)
  }

  // Handle form submission to update marks
  // Updated handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !semester ||
      !subject ||
      !credit ||
      !course ||
      !paper ||
      !type ||
      !ciaMarks ||
      !eseMarks
    ) {
      setError("All fields are required.")
      return
    }

    

    // Add single student data if present and not yet added
    if (
      studentData.studentId &&
      studentData.ciamarksObtained &&
      studentData.esemarksObtained
    ) {
      setStudents((prevStudents) => [
        ...prevStudents,
        {
          studentId: studentData.studentId,
          ciamarksObtained: Number(studentData.ciamarksObtained),
          esemarksObtained: Number(studentData.esemarksObtained),
        },
      ])
    }

    if (
      students.length === 0 &&
      (!studentData.studentId ||
        !studentData.ciamarksObtained ||
        !studentData.esemarksObtained)
    ) {
      setError("At least one student is required.")
      return
    }
    const data = {
      semester,
      subject,
      credit: Number(credit),
      course,
      paper,
      type,
      ciaMarks: Number(ciaMarks),
      eseMarks: Number(eseMarks),
      students: [
        ...students,
        ...(studentData.studentId
          ? [
              {
                studentId: studentData.studentId,
                ciamarksObtained: Number(studentData.ciamarksObtained),
                esemarksObtained: Number(studentData.esemarksObtained),
              },
            ]
          : []),
      ],
    }
let checkStudentExist=""
    try {
      // Check if each student ID exists
      const users = data.students
      for (let student of users) {
        checkStudentExist=student.studentId
        const response = await SummaryApi.checkStudentExist(
          student.studentId
        )
      }
      const response = await SummaryApi.updateMarksForSemester(data)
      setMessage(response.message)
      toast.success("Marks updated successfully!")
      setError("")
      setStudents([])
      setSemester("")
      setSubject("")
      setCredit("")
      setCourse("")
      setPaper("")
      setType("")
      setCiaMarks("")
      setEseMarks("")
      setStudentData({
        studentId: "",
        ciamarksObtained: "",
        esemarksObtained: "",
      })
    } catch (error) {
      if (!error.response.data.exists) {
        setError(`The following Student ID: ${checkStudentExist} not exist.`)
        toast.error(
          `The following Student ID: ${checkStudentExist} not exist.`
        )
        return
      } else {
        setError(
          "An error occurred while updating marks."
        )
        toast.error("An error occurred while updating marks.")
      }
      setMessage("")
    }
  }

const openModal = () => {
  setIsModalOpen(true)
}

const closeModal = () => {
  setIsModalOpen(false)
  setNewStudentData({
    studentId: "",
    name: "",
    roll: "",
    no: "",
    registrationNo: "",
    session: "",
    year: "2024",
    semesters: [
      {
        semester: "1", // default value
        results: [],
      },
    ],
  })
}
  const handleNewStudentChange = (e) => {
    setNewStudentData({
      ...newStudentData,
      [e.target.name]: e.target.value,
    })
  }

   const addNewStudent = async () => {
    if(!newStudentData.studentId || !newStudentData.name || !newStudentData.roll || !newStudentData.no || !newStudentData.registrationNo || !newStudentData.session || !newStudentData.year){
      toast.error("All required fields must be filled.")
      return
    }
     try {
      const response = await SummaryApi.addStudent(newStudentData)
       toast.success("New student added successfully!")
       closeModal()
     } catch (err) {
       toast.error("Error adding new student.")
     }
   }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <button
        type="button"
        onClick={openModal}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Add New Student
      </button>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 mt-10">
          <div className="bg-white p-8 rounded-md max-w-md w-full border border-yellow-400 shadow-md hover:shadow-2xl">
            <h3 className="text-xl mb-6 text-center text-blue-600 font-semibold">
              Add New Student
            </h3>
            <div>
              <input
                type="text"
                name="studentId"
                value={newStudentData.studentId}
                onChange={handleNewStudentChange}
                placeholder="Student ID"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md bg-indigo-50 focus:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="text"
                name="name"
                value={newStudentData.name}
                onChange={handleNewStudentChange}
                placeholder="Name"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md bg-pink-50 focus:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <input
                type="text"
                name="roll"
                value={newStudentData.roll}
                onChange={handleNewStudentChange}
                placeholder="Roll"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md bg-yellow-50 focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <input
                type="text"
                name="no"
                value={newStudentData.no}
                onChange={handleNewStudentChange}
                placeholder="Number"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md bg-teal-50 focus:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <input
                type="text"
                name="registrationNo"
                value={newStudentData.registrationNo}
                onChange={handleNewStudentChange}
                placeholder="Registration No"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md bg-purple-50 focus:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="text"
                name="session"
                value={newStudentData.session}
                onChange={handleNewStudentChange}
                placeholder="Session"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md bg-teal-50 focus:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
             

              <button
                type="button"
                onClick={addNewStudent}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors mb-2"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center mb-4">
        Manual Marks Entry
      </h2>

      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border border-blue-300 p-4 rounded-md"
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Enter Semester"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              Credit
            </label>
            <input
              type="text"
              value={credit}
              onChange={(e) => {
                const value = e.target.value
                // Allow only numbers and prevent empty values
                if (/^\d*$/.test(value)) {
                  setCredit(value)
                }
              }}
              placeholder="Enter Credit"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Enter Course"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              Paper
            </label>
            <input
              type="text"
              value={paper}
              onChange={(e) => setPaper(e.target.value)}
              placeholder="Enter Paper"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              Type (e.g., Th, Proj, etc.)
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Enter Type"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              CIA Marks
            </label>
            <input
              type="text"
              value={ciaMarks}
              onChange={(e) => {
                const value = e.target.value
                // Allow only numbers and prevent empty values
                if (/^\d*$/.test(value)) {
                  setCiaMarks(value)
                }
              }}
              placeholder="Enter CIA Marks"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              ESE Marks
            </label>
            <input
              type="text"
              value={eseMarks}
              onChange={(e) => {
                const value = e.target.value
                // Allow only numbers and prevent empty values
                if (/^\d*$/.test(value)) {
                  setEseMarks(value)
                }
              }}
              placeholder="Enter ESE Marks"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>
        </div>

        <div className="form-group mb-4">
          <h3 className="text-lg font-semibold mb-2">Student Marks</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              name="studentId"
              value={studentData.studentId}
              onChange={handleStudentChange}
              placeholder="Student ID"
              className="w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
            <input
              type="number"
              name="ciamarksObtained"
              value={studentData.ciamarksObtained}
              onChange={handleStudentChange}
              placeholder="CIA Marks"
              className="w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
            <input
              type="number"
              name="esemarksObtained"
              value={studentData.esemarksObtained}
              onChange={handleStudentChange}
              placeholder="ESE Marks"
              className="w-full p-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
            <button
              type="button"
              onClick={addStudentMarks}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Student
            </button>
          </div>

          <ul className="mt-4">
            {students.map((student, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-2 border-b"
              >
                {student.studentId} - CIA: {student.ciamarksObtained} | ESE:{" "}
                {student.esemarksObtained}
                <button
                  type="button"
                  onClick={() => removeStudent(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
        >
          Submit Marks
        </button>
      </form>
    </div>
  )
}

export default ManualMarksEntry
