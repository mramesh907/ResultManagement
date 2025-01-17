import React from "react"

const ScholarshipList = ({ eligibleScholarships }) => {
  return (
    <>
      {eligibleScholarships.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-xl font-semibold text-blue-700 mb-4">
            Eligible Scholarships
          </h4>
          <div className="space-y-6 bg-gray-100 rounded-lg p-6">
            {eligibleScholarships.map((scholarship, idx) => (
              <div
                key={idx}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-2xl transition duration-300"
              >
                <h5 className="font-semibold text-xl text-blue-600">
                  {scholarship.name}
                </h5>
                <p className="text-gray-600 mt-2">{scholarship.description}</p>
                <div className="mt-4">
                  <p>
                    <strong className="text-gray-800">Reward Amount:</strong>{" "}
                    {scholarship.rewardAmount} INR
                  </p>
                  <p>
                    <strong className="text-gray-800">Eligibility:</strong> Min
                    CGPA: {scholarship.eligibility.minCGPA}, Max Income:{" "}
                    {scholarship.eligibility.maxIncome} INR
                  </p>
                  <p>
                    <strong className="text-gray-800">Target Group:</strong>{" "}
                    {scholarship.eligibility.targetGroup}
                  </p>
                  <p>
                    <strong className="text-gray-800">
                      Application Deadline:
                    </strong>{" "}
                    {new Date(
                      scholarship.applicationDeadline
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href={scholarship.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 transition duration-200"
                  >
                    Apply Here
                  </a>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    <strong>Official Website:</strong>{" "}
                    <a
                      href={scholarship.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {scholarship.officialWebsite}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-gray-500 text-lg text-center">
          No eligible scholarships found for the given criteria.
        </p>
      )}
    </>
  )
}

export default ScholarshipList
