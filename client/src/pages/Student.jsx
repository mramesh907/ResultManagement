import React, { useState } from "react"
import { toast } from "react-hot-toast"
import SummaryApi from "../common/SummaryApi.js"
import generatePDF from "../utils/generatePDF.js" // Import the generatePDF function
import StudentNavbar from "./StudentNavbar" // Import the StudentNavbar

const Student = () => {
  const [studentId, setStudentId] = useState("")
  const [semester, setSemester] = useState("")
  const [semesterData, setSemesterData] = useState(null)
  const [gpa, setGPA] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchAttempted, setFetchAttempted] = useState(false)
  const [cgpa, setCGPA] = useState(null)
  const [familyIncome, setFamilyIncome] = useState("")
  const [eligibleScholarships, setEligibleScholarships] = useState([])
   const [studentId1, setStudentId1] = useState("")
   const [studentId2, setStudentId2] = useState("")
   const [compsemester, setCompSemester] = useState("")
  const [selectedSection, setSelectedSection] = useState("marksheet") // New state to track the selected section
  const [comparisonData, setComparisonData] = useState([])

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
      if(error.response && error.response.status === 404){
        toast.error("No data found for this student and semester.")
      }else{
        toast.error("Error fetching data. Please try again later.")
      }
      
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

  const fetchScholarships = async () => {
    if (!cgpa || !familyIncome) {
      toast.error("Please enter both CGPA and Family Income.")
      return
    }
    if(cgpa > 10 || cgpa < 0){
      toast.error("CGPA must be between 0 and 10.")
      return
    }
    if(familyIncome < 0){
      toast.error("Family Income must be a positive number.")
      return
    }


    try {
      const scholarshipResponse = await SummaryApi.getEligibleScholarships(
        cgpa,
        familyIncome
      )
      setEligibleScholarships(scholarshipResponse)
    } catch (error) {
      if(error.response && error.response.status === 404){
        setEligibleScholarships([])
        toast.error("No eligible scholarships found.")
      }else{
        toast.error("Error fetching scholarships. Please try again later.")
      }
      
    }
  }




  const compareStudents = async () => {
    if (!studentId1 || !studentId2 || !compsemester) {
      toast.error("Please fill in both student IDs and select a semester.")
      return
    }
    try {
      const comparisonResponse = await SummaryApi.getCompareResults(
        studentId1,
        studentId2,
        compsemester
      )
      console.log("Comparison Response:", comparisonResponse);
      
      if (comparisonResponse && comparisonResponse.length > 0) {
        setComparisonData(comparisonResponse)
        toast.success("Comparison results fetched successfully!")
      } else {
        setComparisonData(null)
        toast.error("No comparison data found.")
      }
    } catch (error) {
      setComparisonData(null)
      if(error.response && error.response.status === 404){
        toast.error("No comparison data found.")
      }else{
        toast.error("Error fetching comparison data. Please try again later.")
      }
    }
  }

  return (
    <div className="p-6">
      {/* Student Navbar */}
      <StudentNavbar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
      />

      {selectedSection === "marksheet" && (
        <div className="mt-6 max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
            Student Panel
          </h2>

          <div className="mb-6">
            {/* Student ID */}
            <label
              htmlFor="studentId"
              className="block font-semibold text-gray-700 mb-2"
            >
              Student ID:
            </label>
            <input
              type="text"
              id="studentId"
              value={studentId || ""}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter Student ID (e.g. 1001)"
              className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4 mx-auto"
            />
          </div>

          <div className="mb-6">
            {/* Semester */}
            <label
              htmlFor="semester"
              className="block font-semibold text-gray-700 mb-2"
            >
              Semester:
            </label>
            <input
              type="text"
              value={semester || ""}
              id="semester"
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Enter Semester (e.g. 1, 2, 3, 4, 5, 6, 7, 8)"
              className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4 mx-auto"
            />
          </div>

          {/* Fetch Data Button */}
          <button
            onClick={fetchStudentData}
            disabled={loading}
            className={`p-3 w-full rounded-md text-white transition duration-300 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Fetching Data..." : "Get Marksheet"}
          </button>

          {/* Error Message */}
          {fetchAttempted && semesterData === null && (
            <p className="text-red-600 mt-4 text-sm text-center">
              No valid data found for the provided Student ID and Semester.
            </p>
          )}

          {/* Display Semester Data & Buttons */}
          {semesterData && semesterData.semester && (
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">
                Student Semester Marksheet
              </h3>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                {/* Preview PDF Button */}
                <button
                  onClick={() => handleGeneratePDF(true)} // Preview PDF
                  className="bg-yellow-500 text-white p-3 rounded-md hover:bg-yellow-600 w-full md:w-auto"
                >
                  Preview PDF
                </button>

                {/* Download PDF Button */}
                <button
                  onClick={() => handleGeneratePDF()} // Download PDF
                  className="bg-green-500 text-white p-3 rounded-md hover:bg-green-600 w-full md:w-auto"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedSection === "scholarships" && (
        <div className="mt-6 max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-300">
          <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            Check for Eligible Scholarships
          </h3>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="cgpa"
                className="block font-semibold mb-2 text-gray-700"
              >
                Enter CGPA:
              </label>
              <input
                type="number"
                value={cgpa || ""}
                id="cgpa"
                onChange={(e) => setCGPA(e.target.value)}
                placeholder="Enter CGPA"
                className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>
            <div>
              <label
                htmlFor="familyIncome"
                className="block font-semibold mb-2 text-gray-700"
              >
                Enter Family Income:
              </label>
              <input
                type="number"
                id="familyIncome"
                value={familyIncome || ""}
                onChange={(e) => setFamilyIncome(e.target.value)}
                placeholder="Enter Family Income"
                className="p-3 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>
          </div>

          <button
            onClick={fetchScholarships}
            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 w-full md:w-auto"
          >
            Check Scholarships
          </button>

          {/* Display Multiple Scholarships */}
          {eligibleScholarships.length > 0 ? (
            <div className="mt-6">
              <h4 className="text-xl font-semibold text-blue-700 mb-4">
                Eligible Scholarships
              </h4>
              <div className="space-y-6 bg-gray-100 rounded-lg p-6">
                {eligibleScholarships.map((scholarship, idx) => (
                  <div
                    key={idx}
                    className="bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transition duration-300"
                  >
                    <h5 className="font-semibold text-xl text-blue-600">
                      {scholarship.name}
                    </h5>
                    <p className="text-gray-600 mt-2">
                      {scholarship.description}
                    </p>
                    <div className="mt-4">
                      <p>
                        <strong className="text-gray-800">
                          Reward Amount:
                        </strong>{" "}
                        {scholarship.rewardAmount} INR
                      </p>
                      <p>
                        <strong className="text-gray-800">Eligibility:</strong>{" "}
                        Min CGPA: {scholarship.eligibility.minCGPA}, Max Income:{" "}
                        {scholarship.eligibility.maxIncome} INR
                      </p>
                      <p>
                        <strong className="text-gray-800">Target Group:</strong>{" "}
                        {scholarship.eligibility.targetGroup}
                      </p>
                      <p>
                        <strong className="text-gray-800">
                          Application Deadline:
                        </strong>{" "}
                        {new Date(
                          scholarship.applicationDeadline
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4">
                      <a
                        href={scholarship.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 transition duration-200"
                      >
                        Apply Here
                      </a>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Official Website:</strong>
                        <a
                          href={scholarship.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {scholarship.officialWebsite}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-gray-500 text-lg text-center">
              No eligible scholarships found for the given criteria.
            </p>
          )}
        </div>
      )}

      {/* Comparison Section */}
      {selectedSection === "comparison" && (
        <div className="mb-6 max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl border border-yellow-300 mt-4">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 text-center">
            Compare Students
          </h3>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Input for Student 1 */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-gray-800">
                Student ID 1:
              </label>
              <input
                type="text"
                value={studentId1 || ""}
                onChange={(e) => setStudentId1(e.target.value)}
                placeholder="Enter Student ID 1"
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50 "
              />
            </div>

            {/* Input for Student 2 */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Student ID 2:
              </label>
              <input
                type="text"
                value={studentId2 || ""}
                onChange={(e) => setStudentId2(e.target.value)}
                placeholder="Enter Student ID 2"
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-blue-50"
              />
            </div>
          </div>

          {/* Input for Semester */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">
              Semester:
            </label>
            <input
              type="text"
              value={compsemester || ""}
              onChange={(e) => setCompSemester(e.target.value)}
              placeholder="Enter Semester"
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2 bg-blue-50"
            />
          </div>

          {/* Button to Fetch Comparison Data */}
          <button
            onClick={compareStudents}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-md hover:from-purple-600 hover:to-indigo-700 transition duration-300 w-full md:w-auto"
          >
            Compare Students
          </button>

          {/* Display Comparison Data */}
          {comparisonData && comparisonData.length > 0 ? (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-blue-700">
                Comparison Results:
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200 rounded-lg shadow-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        Paper Name
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        Student 1 Total Marks
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        Student 2 Total Marks
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        Marks Difference
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((paper, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="border border-gray-200 px-4 py-2">
                          {paper.paperName}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {paper.student1TotalMarks}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {paper.student2TotalMarks}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {paper.marksDifference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-500 text-center">
              No comparison data available.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Student
