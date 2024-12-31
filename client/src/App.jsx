import React from 'react'
import Student from './components/Student'
import Admin from './components/Admin'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Student Result Management
        </h1>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold">Admin Section</h2>
          <Admin />
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold">Student Section</h2>
          <Student />
        </div>
      </div>
    </>
  )
}

export default App
