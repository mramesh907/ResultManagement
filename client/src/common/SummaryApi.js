import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL // Base URL for the API

// Utility function for making API requests
const apiRequest = async (url, method, data = null, isSignIn = false) => {
  try {
    // Get the token from localStorage (where it is stored after login)
    const token = localStorage.getItem("token")

    // Only include the Authorization header during the signin request
    const headers = isSignIn
      ? {
          Authorization: token ? `Bearer ${token}` : "",
        }
      : {}

    const response = await axios({
      method,
      url: `${baseURL}${url}`,
      data,
      headers,
      withCredentials: true, // Include credentials (cookies) for cross-origin requests
    })

    // console.log("API Response:", response.data)
    return response.data // Return the response data
  } catch (error) {
    // console.log("API Error:", error.response.data.message)

    // // Check if the error response exists (error from the backend)
    // const errorMessage =
    //   error.response && error.response.data
    //     ? error.response.data.error || error.response.data.message
    //     : error.message // Fallback to general error message
    throw error // Re-throw with error message
  }
}

// API Functions for student data operations
const SummaryApi = {
  signin: async (email, password) => {
    return apiRequest("/api/auth/signin", "POST", { email, password }, true) // Pass true for signin
  },

  signup: async (email, password) => {
    return apiRequest("/api/auth/signup", "POST", { email, password })
  },
  addStudent: async (studentData) => {
    return apiRequest("/api/students/add-student", "POST", studentData)
    // http://localhost:8080/api/students/add-student
  },

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
    return apiRequest(
      `/api/students/${studentId}/semester/${semester}`,
      "PUT",
      { results: marksData.results }
    )
  },
  // Update student results for a semester
  updateMarksForSemester: async (data) => {
    // console.log('Data in API:',data)
    return apiRequest("/api/students/update-marks", "POST", data)
  },

  // Get top student for a specific semester
  getSemesterResults: async (semester) => {
    return apiRequest(`/api/students/topStudentForSemester/${semester}`, "GET")
  },

  // Calculate CGPA
  calculateCGPA: async (studentId, semester) => {
    return apiRequest(`/api/students/calculate-cgpa/${studentId}`, "GET")
  },
  calculateGPA: async (studentId) => {
    return apiRequest(`/api/students/calculate-gpa/${studentId}`, "GET")
  },

  // Get top rankers
  getTopRankers: async () => {
    return apiRequest(`/api/students/top-rankers`, "GET")
  }, // Add new scholarship
  addScholarship: async (scholarshipData) => {
    return apiRequest("/api/rewards/scholarships", "POST", scholarshipData)
  },

  // Fetch all scholarships
  getScholarships: async () => {
    return apiRequest("/api/rewards/scholarships", "GET")
  },

  // Get eligible scholarships based on CGPA and family income
  getEligibleScholarships: async (cgpa, familyIncome) => {
    return apiRequest(
      `/api/rewards/eligible-scholarships?cgpa=${cgpa}&familyIncome=${familyIncome}`,
      "GET"
    )
  },
  getCompareResults: async (studentId1, studentId2, semester) => {
    return apiRequest(
      `/api/students/compareResults/${studentId1}/${studentId2}/semester/${semester}`,
      "GET"
    )
  },
  getSemesterWiseCount: async () => {
    return apiRequest("/api/students/admin/semester-wise-count", "GET")
  },
  getSemesterWisePerformance: async () => {
    return apiRequest("/api/students/admin/semester-wise-performance", "GET")
  },
  checkEmail: async (email) => {
    return apiRequest(`/api/auth/check-email`, "POST", { email }) // Send email in body
  },
  resetPassword: async (email, newPassword) => {
    return apiRequest(`/api/auth/change-password`, "POST", {
      email,
      newPassword,
    }) // Send email and password in body
  },
}

export default SummaryApi
