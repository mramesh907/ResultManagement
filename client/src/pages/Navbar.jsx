import React, { useState } from "react"

const Navbar = ({ onSelectSection, selectedSection }) => {
  const [isOpen, setIsOpen] = useState(false) // State to toggle mobile menu

  return (
    <nav className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold cursor-pointer mr-4">Dashboard</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {[
              "marks",
              "upload",
              "topStudent",
              "studentlist",
              "scholarships",
              "charts",
              "signup",
            ].map((section) => (
              <div
                key={section}
                onClick={() => onSelectSection(section)}
                className={`cursor-pointer px-4 py-2 rounded ${
                  selectedSection === section
                    ? "bg-white text-black shadow-md"
                    : "hover:bg-white hover:text-black"
                }`}
              >
                {section === "marks" && "Manual Marks Entry"}
                {section === "upload" && "Upload Results"}
                {section === "topStudent" && "Top Student & Rankers"}
                {section === "studentlist" && "Student List"}
                {section === "scholarships" && "Manage Scholarships"}
                {section === "charts" && "Student Leaderboard"}
                {section === "signup" && "Signup"}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-purple-600 px-4 py-6 space-y-4">
          {[
            "marks",
            "upload",
            "topStudent",
            "studentlist",
            "scholarships",
            "charts",
            "signup",
          ].map((section) => (
            <div
              key={section}
              onClick={() => {
                onSelectSection(section)
                setIsOpen(false) // Close menu after selection
              }}
              className={`cursor-pointer px-4 py-2 rounded ${
                selectedSection === section
                  ? "bg-white text-black shadow-md"
                  : "hover:bg-white hover:text-black"
              }`}
            >
              {section === "marks" && "Manual Marks Entry"}
              {section === "upload" && "Upload Results"}
              {section === "topStudent" && "Top Student & Rankers"}
              {section === "studentlist" && "Student List"}
              {section === "scholarships" && "Manage Scholarships"}
              {section === "charts" && "Student Leaderboard"}
              {section === "signup" && "Signup"}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar
