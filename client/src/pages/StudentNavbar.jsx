import React, { useState } from "react"
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi" // Import icons

const StudentNavbar = ({ selectedSection, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false) // State to toggle mobile menu

  const sections = [
    { id: "marksheet", label: "Marksheet" },
    { id: "scholarships", label: "Scholarships" },
    { id: "comparison", label: "Compare Students" },
  ]

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-2xl font-bold cursor-pointer">
            Student Portal
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`relative cursor-pointer px-4 py-2 text-lg font-semibold transition-all duration-300 ${
                  selectedSection === section.id
                    ? "text-yellow-300"
                    : "hover:text-yellow-300"
                }`}
              >
                {section.label}
                {/* Underline Animation */}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-1 bg-yellow-300 transition-all duration-300 ${
                    selectedSection === section.id
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <HiOutlineX className="w-6 h-6" /> // Close icon
              ) : (
                <HiOutlineMenu className="w-6 h-6" /> // Hamburger icon
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-6 space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => {
                onSectionChange(section.id)
                setIsOpen(false) // Close menu after selection
              }}
              className={`relative cursor-pointer px-4 py-2 text-lg font-semibold transition-all duration-300 ${
                selectedSection === section.id
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              {section.label}
              {/* Underline Animation */}
              <span
                className={`absolute bottom-0 left-0 w-0 h-1 bg-yellow-300 transition-all duration-300 ${
                  selectedSection === section.id
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}

export default StudentNavbar
