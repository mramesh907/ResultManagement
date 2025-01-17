import { createBrowserRouter } from "react-router-dom"
import App from "../App"
import Home from "../pages/Home"
import Student from "../pages/Student"
import Admin from "../pages/Admin"
import ForgotPassword from "../components/ForgotPassword"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/student",
        element: <Student />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/forgot-password", // Add the new route
        element: <ForgotPassword />, // Render ForgotPassword component
      },
    ],
  },
])

export default router
