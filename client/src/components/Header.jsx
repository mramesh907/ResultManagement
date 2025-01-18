import React, { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FaHome, FaUser, FaBars, FaTimes } from "react-icons/fa" // Importing icons
import { RiAdminFill } from "react-icons/ri"
import logo from "../assets/Midnapore_College_logo.png"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation() // Hook to access the current location (URL)

  // Function to display greeting toast
  const showGreeting = () => {
    toast.dismiss()
    const currentHour = new Date().getHours()
    let greetingMessage = "Good "

    if (currentHour < 12) {
      greetingMessage += "Morning!"
    } else if (currentHour < 15) {
      // Good Noon between 12 PM to 2:59 PM
      greetingMessage += "Noon!"
    } else if (currentHour < 18) {
      // Good Afternoon between 3 PM to 5:59 PM
      greetingMessage += "Afternoon!"
    } else if (currentHour < 21) {
      // Good Evening between 6 PM to 8:59 PM
      greetingMessage += "Evening!"
    } else {
      // Good Night after 9 PM
      greetingMessage += "Night!"
    }

    toast.success(greetingMessage, { duration: 1000 }) // You can adjust the duration
  }

  // Show greeting when the component mounts (first render)
  useEffect(() => {
    showGreeting()
  }, [])

  // Toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location]) // This runs every time the location changes (i.e., on navigation)

  return (
    <header className="h-20 shadow-md sticky top-0 flex bg-white z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* logo */}
        <div className="w-auto cursor-pointer">
          <NavLink to="/" className="block">
            <img width={350} height={10} src={logo} alt="logo" />
          </NavLink>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-2xl p-3 rounded-md mr-2"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <FaTimes className="text-2xl" /> // Close icon (X)
          ) : (
            <FaBars className="text-2xl" /> // Open icon (Hamburger)
          )}
        </button>

        {/* Navigation */}
        <nav
          className={`lg:flex ${isMenuOpen ? "block" : "hidden"} absolute lg:static top-20 left-0 right-0 bg-white lg:bg-transparent lg:flex-row flex-col items-center gap-8 lg:z-auto z-10 lg:mr-6`}
        >
          <ul className="flex lg:flex-row flex-col lg:gap-8 gap-4 items-center">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-blue-500 font-bold" : "hover:text-blue-500"
                }
              >
                <FaHome className="inline-block mr-2" /> Home{" "}
                {/* Adding the Home icon */}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/student"
                className={({ isActive }) =>
                  isActive ? "text-blue-500 font-bold" : "hover:text-blue-500"
                }
              >
                <FaUser className="inline-block mr-2" /> Student
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "text-blue-500 font-bold" : "hover:text-blue-500"
                }
              >
                <RiAdminFill className="inline-block mr-2" /> Admin
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
