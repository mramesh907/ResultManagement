import React, { useState } from "react"
import SummaryApi from "../common/SummaryApi.js"
import { toast } from "react-hot-toast"

const ScholarshipForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eligibility: {
      minCGPA: 0,
      maxIncome: 0,
      targetGroup: "",
    },
    rewardAmount: 0,
    applicationDeadline: "",
    applyLink: "",
    officialWebsite: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name in formData.eligibility) {
      // Update nested `eligibility` object
      setFormData({
        ...formData,
        eligibility: {
          ...formData.eligibility,
          [name]: value,
        },
      })
    } else {
      // Update top-level fields
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await SummaryApi.addScholarship(formData)
      toast.success("Scholarship added successfully!")
      setFormData({
        name: "",
        description: "",
        eligibility: {
          minCGPA: 0,
          maxIncome: 0,
          targetGroup: "",
        },
        rewardAmount: 0,
        applicationDeadline: "",
        applyLink: "",
        officialWebsite: "",
      })
    } catch (error) {
      toast.error("Failed to add scholarship")
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        Add Scholarship
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Scholarship Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter scholarship name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Briefly describe the scholarship"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Minimum CGPA
            </label>
            <input
              type="number"
              name="minCGPA"
              value={formData.eligibility.minCGPA}
              onChange={handleChange}
              placeholder="e.g., 6.5"
              required
              min={0}
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Maximum Income (₹)
            </label>
            <input
              type="number"
              name="maxIncome"
              value={formData.eligibility.maxIncome}
              onChange={handleChange}
              placeholder="e.g., 200000"
              required
              min={0}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Target Group
          </label>
          <input
            type="text"
            name="targetGroup"
            value={formData.eligibility.targetGroup}
            onChange={handleChange}
            placeholder="Enter target group (e.g.,All, SC/ST, OBC, Female Students)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Reward Amount (₹)
          </label>
          <input
            type="number"
            name="rewardAmount"
            value={formData.rewardAmount}
            onChange={handleChange}
            placeholder="Enter reward amount"
            required
            min={0}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Application Deadline
          </label>
          <input
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Application Link
          </label>
          <input
            type="url"
            name="applyLink"
            value={formData.applyLink}
            onChange={handleChange}
            placeholder="e.g., https://apply.scholarship.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Official Website
          </label>
          <input
            type="url"
            name="officialWebsite"
            value={formData.officialWebsite}
            onChange={handleChange}
            placeholder="e.g., https://scholarship.gov.in"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add Scholarship
        </button>
      </form>
    </div>
  )
}

export default ScholarshipForm
