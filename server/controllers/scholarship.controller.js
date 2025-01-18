// /controllers/scholarshipController.js

import Scholarship from "../models/scholarship.model.js"

// Add a new scholarship
export const addScholarship = async (req, res) => {
  try {
    const {
      name,
      description,
      eligibility,
      rewardAmount,
      applicationDeadline,
      applyLink,
      officialWebsite,
    } = req.body

    const existingScholarship = await Scholarship.findOne({ name })
    if (existingScholarship) {
      // Update all details of the existing scholarship
      await Scholarship.findOneAndUpdate(
        { name }, // Filter by scholarship name
        {
          description,
          eligibility,
          rewardAmount,
          applicationDeadline,
          applyLink,
          officialWebsite,
        },
        { new: true } // Return the updated document
      )

      return res
        .status(200)
        .json({ message: "Scholarship updated successfully!" })
    }

    // Create a new scholarship document
    const newScholarship = new Scholarship({
      name,
      description,
      eligibility,
      rewardAmount,
      applicationDeadline,
      applyLink,
      officialWebsite,
    })

    // Save to database
    await newScholarship.save()
    res.status(201).json({ message: "Scholarship added successfully!" })
  } catch (error) {
    console.error("Error adding scholarship:", error)
    res.status(500).json({ error: "Failed to add scholarship" })
  }
}

// Get all scholarships
export const getScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find()
    res.status(200).json(scholarships)
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    res.status(500).json({ error: "Failed to fetch scholarships" })
  }
}

// Get scholarships by eligibility criteria
export const getEligibleScholarships = async (req, res) => {
  const { cgpa, familyIncome } = req.query // Query params: cgpa, familyIncome
  try {
    const scholarships = await Scholarship.find({
      "eligibility.minCGPA": { $lte: cgpa },
      "eligibility.maxIncome": { $gte: familyIncome },
    })

    if (scholarships.length === 0) {
      return res
        .status(404)
        .json({ message: "No eligible scholarships found." })
    }

    res.status(200).json(scholarships)
  } catch (error) {
    console.error("Error fetching eligible scholarships:", error)
    res.status(500).json({ error: "Failed to fetch eligible scholarships" })
  }
}
