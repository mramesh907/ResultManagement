import React from "react"
// import Student from './components/Student'
// import Admin from './components/Admin'
import { useState } from "react"
import reactLogo from "./assets/react.svg"
// import viteLogo from '/vite.svg'
import "./App.css"
import { Toaster } from "react-hot-toast"
import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default App
