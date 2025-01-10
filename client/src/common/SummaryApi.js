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

    console.log("API Response:", response.data)
    return response.data // Return the response data
  } catch (error) {
    console.error("API Request Error:", error)
    throw error // Re-throw the error to handle it in the component
  }
}


// API Functions for student data operations
const SummaryApi = {
  signin: async (email, password) => {
    return apiRequest("/api/auth/signin", "POST", { email, password }, true); // Pass true for signin
  },

  // Upload student data
  resultsUpload: async (studentData) => {
    return apiRequest("/api/students/import", "POST", studentData);
  },

  // Fetch student details based on studentId and semester
  fetchStudentDetails: async (studentId, semester) => {
    return apiRequest(`/api/students/${studentId}/semester/${semester}`, "GET");
  },

  // Check if a student exists
  checkStudentExist: async (studentId) => {
    return apiRequest(`/api/students/checkStudentExist/${studentId}`, "GET");
  },

  // Update student results
  updateStudentResults: async (studentId, semester, marksData) => {
    return apiRequest(
      `/api/students/${studentId}/semester/${semester}`,
      "PUT",
      { results: marksData.results }
    );
  },

  // Get top student for a specific semester
  getSemesterResults: async (semester) => {
    return apiRequest(`/api/students/topStudentForSemester/${semester}`, "GET");
  },

  // Calculate CGPA
  calculateCGPA: async (studentId, semester) => {
    return apiRequest(
      `/api/students/calculate-cgpa/${studentId}/${semester}`,
      "GET"
    );
  },

  // Get top rankers
  getTopRankers: async () => {
    return apiRequest(`/api/students/top-rankers`, "GET");
  },
};




export default SummaryApi
