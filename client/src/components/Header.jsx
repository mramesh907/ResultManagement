import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { FaHome, FaUser, FaBars, FaTimes } from "react-icons/fa" // Importing icons
import { RiAdminFill } from "react-icons/ri"
import logo from "../assets/Midnapore_College_logo.png"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  return (
    <header className="h-20 shadow-md sticky top-0 flex bg-white z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* logo */}
        <div className="w-full cursor-pointer">
          <NavLink to="/" className="block">
            <img width={350} height={10} src={logo} alt="logo" />
          </NavLink>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden text-xl" onClick={toggleMenu}>
          {isMenuOpen ? (
            <FaTimes className="text-2xl" /> // Close icon (X)
          ) : (
            <FaBars className="text-2xl" /> // Open icon (Hamburger)
          )}
        </button>

        {/* Navigation */}
        <nav
          className={`lg:flex ${isMenuOpen ? "block" : "hidden"} absolute lg:static top-20 left-0 right-0 bg-white lg:bg-transparent lg:flex-row flex-col items-center gap-8 lg:z-auto z-10`}
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
