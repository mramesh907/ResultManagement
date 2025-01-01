import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL // Base URL for the API

// Utility function for making API requests
const apiRequest = async (url, method, data = null) => {
  try {
    const response = await axios({
      method,
      url: `${baseURL}${url}`,
      data,
    })
    return response.data // Return the response data
  } catch (error) {
    console.error("API Request Error:", error)
    throw error // Re-throw the error to handle it in the component
  }
}

// API Functions for student data operations
const SummaryApi = {
  // Upload student data
  resultsUpload: async (studentData) => {
    return apiRequest("/api/students/import", "POST", studentData)
  },

  // Fetch student details based on studentId and semester
  fetchStudentDetails: async (studentId, semester) => {
    return apiRequest(`/api/students/${studentId}/semester/${semester}`, "GET")
  },

  // Check if a student exists
  checkStudentExist: async (studentId) => {
    return apiRequest(`/api/students/checkStudentExist/${studentId}`, "GET")
  },

  // Update student results
  updateStudentResults: async (studentId, semester, marksData) => {
    // We now expect marksData to contain the `results` object already, so we directly send it
    return apiRequest(
      `/api/students/${studentId}/semester/${semester}`,
      "PUT",
      { results: marksData.results } // Send the `results` part only, which contains the marks
    )
  },

  // Get top student for a specific semester
  getSemesterResults: async (semester) => {
    return apiRequest(`/api/students/topStudentForSemester/${semester}`, "GET")
  },
}

export default SummaryApi
