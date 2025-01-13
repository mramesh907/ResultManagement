// /src/components/ScholarshipList.js
import React, { useEffect, useState } from "react"
import SummaryApi from "../common/SummaryApi.js"

const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState([])

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const data = await SummaryApi.getScholarships()
        setScholarships(data)
      } catch (error) {
        console.error("Failed to fetch scholarships:", error)
      }
    }
    fetchScholarships()
  }, [])

  return (
    <div>
      <h2>Scholarships List</h2>
      <ul>
        {scholarships.map((scholarship) => (
          <li key={scholarship._id}>
            <h3>{scholarship.name}</h3>
            <p>{scholarship.description}</p>
            <p>
              Eligibility: Minimum CGPA {scholarship.eligibility.minCGPA},
              Maximum Income {scholarship.eligibility.maxIncome}
            </p>
            <p>Reward: ₹{scholarship.rewardAmount}</p>
            <p>
              <a
                href={scholarship.applyLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply Now
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ScholarshipList
