import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi.js"
import generatePDF from "../utils/generatePDF.js" // Import the generatePDF function

const Student = () => {
  const [studentId, setStudentId] = useState("")
  const [semester, setSemester] = useState("")
  const [semesterData, setSemesterData] = useState(null)
  const [gpa, setGPA] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)
  const [cgpa, setCGPA] = useState(null)

  const [familyIncome, setFamilyIncome] = useState("") // State for family income
  const [eligibleScholarships, setEligibleScholarships] = useState([]) // State for scholarships
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
      const gparesponse = await SummaryApi.calculateGPA(studentId)
      if (response && response.semester && gparesponse) {
        setSemesterData(response)
        setGPA(gparesponse)
        setFetchAttempted(true)
        toast.dismiss()
        toast.success("Data fetched successfully!")
      } else {
        setSemesterData(null)
        setGPA(null)
        setFetchAttempted(true)
        toast.dismiss()
        toast.error("No data found for this student and semester.")
      }
    } catch (error) {
      setSemesterData(null)
      setGPA(null)
      setFetchAttempted(true)
      toast.dismiss()
      toast.error("Error fetching data. Please try again later.")
    } finally {
      setLoading(false)
      setStudentId("")
      setSemester("")
    }
  }

  const handleGeneratePDF = (preview = false) => {
    if (semesterData) {
      generatePDF(semesterData, gpa, preview)
    }
  }
  // Function for checking scholarships based on CGPA and Family Income
  const fetchScholarships = async () => {
    if (!cgpa || !familyIncome) {
      toast.error("Please enter both CGPA and Family Income.")
      return
    }

    try {
      const scholarshipResponse = await SummaryApi.getEligibleScholarships(
        cgpa,
        familyIncome
      )
      setEligibleScholarships(scholarshipResponse)
    } catch (error) {
      // console.log("Error fetching scholarships:", error)

      // Check if the error contains a response with the message "No eligible scholarships found."
      if (
        error == "Error: No eligible scholarships found."
      ) {
        toast.error("No eligible scholarships found for the given criteria.")
        setEligibleScholarships([]) // Clear the existing scholarships state
      } else {
        console.log("Error fetching scholarships:", error);
        
        // General error handling
        toast.error("Error fetching scholarships. Please try again later.")
      }
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Panel</h2>

      <div className="mb-4">
        <label htmlFor="studentId" className="block font-semibold mb-2">
          Student ID:
        </label>
        <input
          type="text"
          id="studentId"
          value={studentId || ""}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
          className="p-2 border border-gray-300 rounded mb-2 w-full"
        />

        <label htmlFor="semester" className="block font-semibold mb-2">
          Semester:
        </label>
        <input
          type="text"
          value={semester || ""}
          id="semester"
          onChange={(e) => setSemester(e.target.value)}
          placeholder="Enter Semester"
          className="p-2 border border-gray-300 rounded mb-2 w-full"
        />
        <button
          onClick={fetchStudentData}
          disabled={loading}
          className={`p-2 w-full rounded ${loading ? "bg-gray-500 text-white cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
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
          <div className="mb-4">
            <button
              onClick={() => handleGeneratePDF(true)} // Preview PDF
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-5 mb-5"
            >
              Preview PDF
            </button>

            <button
              onClick={() => handleGeneratePDF()} // Download PDF
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Second Section - Scholarships */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">
          Check for Eligible Scholarships
        </h3>
        <label htmlFor="cgpa" className="block font-semibold mb-2">
          Enter CGPA :
        </label>
        <input
          type="number"
          value={cgpa || ""}
          id="cgpa"
          onChange={(e) => setCGPA(e.target.value)}
          placeholder="Enter CGPA"
          className="p-2 border border-gray-300 rounded mb-4 w-full"
        />

        <label htmlFor="familyIncome" className="block font-semibold mb-2">
          Enter Family Income :
        </label>
        <input
          type="number"
          id="familyIncome"
          value={familyIncome || ""}
          onChange={(e) => setFamilyIncome(e.target.value)}
          placeholder="Enter Family Income"
          className="p-2 border border-gray-300 rounded mb-4 w-full"
        />
        <button
          onClick={fetchScholarships}
          className="bg-green-500 text-white p-2 text-sm rounded hover:bg-green-600 mb-4 inline-block text-center"
        >
          Check Scholarships
        </button>

        {/* Display Multiple Scholarships */}
        {eligibleScholarships.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Eligible Scholarships</h4>
            <ol className="list-decimal pl-6">
              {eligibleScholarships.map((scholarship, idx) => (
                <li key={idx} className="mb-4">
                  <h5 className="font-semibold text-lg">{scholarship.name}</h5>
                  <p>{scholarship.description}</p>
                  <p>
                    <strong>Reward Amount:</strong> {scholarship.rewardAmount}{" "}
                    INR
                  </p>
                  <p>
                    <strong>Eligibility:</strong> Min CGPA:{" "}
                    {scholarship.eligibility.minCGPA}, Max Income:{" "}
                    {scholarship.eligibility.maxIncome} INR
                  </p>
                  <p>
                    <strong>Target Group:</strong>{" "}
                    {scholarship.eligibility.targetGroup}
                  </p>
                  <p>
                    <strong>Application Deadline:</strong>{" "}
                    {new Date(
                      scholarship.applicationDeadline
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Apply Link:</strong>{" "}
                    <a
                      href={scholarship.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      Apply Here
                    </a>
                  </p>
                  <p>
                    <strong>Official Website:</strong>{" "}
                    <a
                      href={scholarship.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      {scholarship.officialWebsite}
                    </a>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="mt-4 text-gray-500">
            No eligible scholarships found for the given criteria.
          </p>
        )}
      </div>
    </div>
  )
}

export default Student
