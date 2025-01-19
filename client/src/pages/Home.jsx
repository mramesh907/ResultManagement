import React, { useRef } from "react"
import Slider from "react-slick"
import banner1 from "../assets/banner1.png"
import banner2 from "../assets/banner2.png"
import banner3 from "../assets/banner3.png"
import banner4 from "../assets/banner4.png"
import banner5 from "../assets/banner5.png"
import myPhoto from "../assets/myPhoto.png"
import guiderPhoto from "../assets/guiderPhoto.jpg"
import { FcPrevious, FcNext } from "react-icons/fc" // Import the icons
// Import Slick Carousel styles
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const bannerImages = [banner1, banner2, banner3, banner4, banner5]

const Home = () => {
  const sliderRef = useRef(null) // Reference for the slider

  const sliderSettings = {
    dots: true, // Show navigation dots
    infinite: true, // Infinite loop
    speed: 500, // Transition speed
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: true, // Enable auto-scrolling
    autoplaySpeed: 2000, // Delay between auto-scrolls
  }

  // Handle Next and Previous Slide
  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext()
    }
  }

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev()
    }
  }

  return (
    <div className="home relative">
      <div className="relative overflow-hidden">
        <Slider ref={sliderRef} {...sliderSettings}>
          {bannerImages.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                className="w-full h-auto"
              />
            </div>
          ))}
        </Slider>

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 text-white bg-blue-600 p-2 rounded-full shadow-lg opacity-80 hover:opacity-100 z-10"
        >
          <FcPrevious size={25} />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 text-white bg-blue-600 p-2 rounded-full shadow-lg opacity-80 hover:opacity-100 z-10"
        >
          <FcNext size={25} />
        </button>
      </div>

      {/* Professional Info Section Below the Slider */}
      <div className="p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Your Photo */}
          <div className="flex-shrink-0 w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600">
            <img
              src={myPhoto}
              alt="Your Photo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Qualifications & Info */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-semibold text-gray-800">
              Ramesh Maity
            </h2>
            <p className="text-gray-600">Aspiring Backend Developer</p>
            <div className="mt-4 text-gray-700">
              <p>
                <strong>Qualifications:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>Bachelor of Computer Applications (BCA)</li>
                <li>Specialized in Backend Development</li>
                <li>Experience in Node.js, Express, and MongoDB</li>
                <li>Familiar with Frontend Development using React</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Project Guide Details */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 mt-8">
          {/* Project Guide Photo */}
          <div className="flex-shrink-0 w-32 h-32 rounded-full overflow-hidden border-4 border-green-600">
            <img
              src={guiderPhoto}
              alt="Project Guide's Photo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Project Guide Info */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-semibold text-gray-800">
              Krishna Gopal Dhal
            </h2>
            <p className="text-gray-600">Project Guide</p>
            <div className="mt-4 text-gray-700">
              <p>
                <strong>Details:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>Ph.D. from the University of Kalyani (2019)</li>
                <li>
                  M.Tech in Computer Science from Kalyani Government Engineering
                  College (2013)
                </li>
                <li>
                  B.Tech from Kalyani Government Engineering College (2011)
                </li>
                <li>
                  Research Interests: Digital Image Processing, Medical Imaging,
                  Nature-Inspired Optimization Algorithms, and Machine Learning
                </li>
                <li>H-index: 25 with 1,773 citations</li>
                <li>Mentor for various student projects and research</li>
              </ul>
            </div>
            <div className="mt-4 text-gray-700">
              <p>
                <strong>Contact:</strong>{" "}
                <a href="mailto:krishnagopal.dhal@midnaporecollege.ac.in">
                  krishnagopal.dhal@midnaporecollege.ac.in
                </a>
              </p>
              <p>
                <strong>Profiles:</strong>
                <a
                  href="https://scholar.google.co.in/citations?hl=en&user=Xu5U3VgAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Scholar
                </a>{" "}
                |
                <a
                  href="https://www.researchgate.net/profile/Krishna-Gopal-Dhal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ResearchGate
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
