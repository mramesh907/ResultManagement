import React, { useRef } from "react"
import Slider from "react-slick"
import banner1 from "../assets/banner1.png"
import banner2 from "../assets/banner2.png"
import banner3 from "../assets/banner3.png"
import banner4 from "../assets/banner4.png"
import banner5 from "../assets/banner5.png"
import myPhoto from "../assets/myPhoto.png"
import { FcPrevious, FcNext } from "react-icons/fc"  // Import the icons
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
    autoplaySpeed: 1000, // Delay between auto-scrolls
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
    <div className="home">
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

      {/* Custom navigation buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white bg-blue-600 p-2 rounded-full shadow-lg sm:left-3 md:left-5 lg:left-8"
      >
        <FcPrevious size={18} /> {/* Previous icon from react-icons */}
      </button>

      <button
        onClick={handleNext}
        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white bg-blue-600 p-2 rounded-full shadow-lg sm:right-3 md:right-5 lg:right-8"
      >
        <FcNext size={18} /> {/* Next icon from react-icons */}
      </button>

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
      </div>
    </div>
  )
}

export default Home
