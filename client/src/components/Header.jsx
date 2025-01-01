import React from "react"
import logo from "../assets/Midnapore_College_logo.png"
import { NavLink } from "react-router-dom"

const Header = () => {
  return (
    <header className="h-20 shadow-md sticky top-0 flex bg-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* logo */}
        <div className="w-full cursor-pointer">
          <NavLink to="/" className="block">
            <img width={350} height={10} src={logo} alt="logo" />
          </NavLink>
        </div>
        <nav>
          <ul className="flex gap-8 items-center">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-blue-500 font-bold" : "hover:text-blue-500"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/student"
                className={({ isActive }) =>
                  isActive ? "text-blue-500 font-bold" : "hover:text-blue-500"
                }
              >
                Student
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "text-blue-500 font-bold" : "hover:text-blue-500"
                }
              >
                Admin
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
