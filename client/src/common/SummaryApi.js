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
  // Authentication
  signin: async (email, password) => apiRequest("/api/auth/signin", "POST", { email, password }, true),
  signup: async (email, password) => apiRequest("/api/auth/signup", "POST", { email, password }),
  checkEmail: async (email) => apiRequest("/api/auth/check-email", "POST", { email }),
  resetPassword: async (email, newPassword) => apiRequest("/api/auth/change-password", "POST", { email, newPassword }),

  // Student Management
  addStudent: async (studentData) => apiRequest("/api/students/add-student", "POST", studentData),
  resultsUpload: async (studentData) => apiRequest("/api/students/import", "POST", studentData),
  fetchStudentDetails: async (studentId, semester) => apiRequest(`/api/students/${studentId}/semester/${semester}`, "GET"),
  checkStudentExist: async (studentId) => apiRequest(`/api/students/checkStudentExist/${studentId}`, "GET"),
  updateStudentResults: async (studentId, semester, marksData) => 
    apiRequest(`/api/students/${studentId}/semester/${semester}`, "PUT", { results: marksData.results }),
  updateMarksForSemester: async (data) => apiRequest("/api/students/update-marks", "POST", data),
  getTopStudentForSemester: async (semester) => apiRequest(`/api/students/topStudentForSemester/${semester}`, "GET"),
  calculateCGPA: async (studentId, semester) => apiRequest(`/api/students/calculate-cgpa/${studentId}`, "GET"),
  calculateGPA: async (studentId) => apiRequest(`/api/students/calculate-gpa/${studentId}`, "GET"),
  getTopRankers: async () => apiRequest("/api/students/top-rankers", "GET"),
  getCompareResults: async (studentId1, studentId2, semester) => 
    apiRequest(`/api/students/compareResults/${studentId1}/${studentId2}/semester/${semester}`, "GET"),
  getSemesterWiseCount: async () => apiRequest("/api/students/admin/semester-wise-count", "GET"),
  getSemesterWisePerformance: async () => apiRequest("/api/students/admin/semester-wise-performance", "GET"),

  // Scholarship Management
  addScholarship: async (scholarshipData) => apiRequest("/api/rewards/scholarships", "POST", scholarshipData),
  getScholarships: async () => apiRequest("/api/rewards/scholarships", "GET"),
  getEligibleScholarships: async (cgpa, familyIncome) => 
    apiRequest(`/api/rewards/eligible-scholarships?cgpa=${cgpa}&familyIncome=${familyIncome}`, "GET"),
};

export default SummaryApi;
