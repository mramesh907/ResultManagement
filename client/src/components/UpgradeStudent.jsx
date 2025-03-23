import React, { useState } from "react";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-hot-toast";

const UpgradeStudents = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [upgradeDetails, setUpgradeDetails] = useState({
    currentSemester: "",
    upgradeSemester: "",
  });
  const [studentsForUpgrade, setStudentsForUpgrade] = useState([]);

  // Handle input change
  const handleUpgradeInputChange = (e) => {
    const { name, value } = e.target;
    setUpgradeDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch students when "Next" is clicked
  const handleFetchStudentsForUpgrade = async () => {
    const { currentSemester, upgradeSemester } = upgradeDetails;

    if (!currentSemester || !upgradeSemester) {
      toast.error("Both Current and Upgrade Semesters are required.");
      return;
    }

    const currentSemNum = Number(currentSemester);
    const upgradeSemNum = Number(upgradeSemester);

    if (upgradeSemNum !== currentSemNum + 1) {
      toast.error("Only one semester upgrade is allowed.");
      return;
    }

    try {
      const response = await SummaryApi.fetchStudentBySemester(currentSemester);
      if (response.length === 0) {
        toast.error(`No students found in Semester ${currentSemester}.`);
        return;
      }

      // Add `isSelected: true` by default
      setStudentsForUpgrade(
        response.map((student) => ({
          ...student,
          isSelected: true,
        }))
      );

      setStep(2);
    } catch (error) {
      toast.error("Failed to fetch students. Please try again.");
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setStudentsForUpgrade((prevStudents) =>
      prevStudents.map((student) =>
        student.studentId === studentId
          ? { ...student, isSelected: !student.isSelected }
          : student
      )
    );
  };

  // Upgrade selected students
  const handleUpgradeStudents = async () => {
    const { currentSemester, upgradeSemester } = upgradeDetails;

    if (!currentSemester || !upgradeSemester) {
      toast.error("Both Current and Upgrade Semesters are required.");
      return;
    }

    const selectedStudents = studentsForUpgrade.filter((student) => student.isSelected);
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to upgrade.");
      return;
    }

    try {
      const response = await SummaryApi.upgradeSemester(
        currentSemester,
        upgradeSemester,
        selectedStudents.map((s) => s._id)
      );

      if (response.success) {
        toast.success(`${response.message}. Already upgraded: ${response.alreadyUpgraded}`);
        onClose(); // Close the modal
      } else {
        toast.error(response.error || "Failed to upgrade students.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full md:w-1/2 lg:w-1/3 border-2 border-gray-300 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Upgrade Students
        </h2>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Semester
              </label>
              <input
                type="text"
                name="currentSemester"
                value={upgradeDetails.currentSemester}
                onChange={handleUpgradeInputChange}
                placeholder="Enter Current Semester"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upgrade Semester
              </label>
              <input
                type="text"
                name="upgradeSemester"
                value={upgradeDetails.upgradeSemester}
                onChange={handleUpgradeInputChange}
                placeholder="Enter Upgrade Semester"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Students:</h3>
            <div className="border border-gray-300 p-2 rounded-md max-h-40 overflow-y-auto">
              {studentsForUpgrade.map((student) => (
                <label key={student.studentId} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={student.isSelected}
                    onChange={() => toggleStudentSelection(student.studentId)}
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <span className="text-gray-700">{student.name} ({student.studentId})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={handleFetchStudentsForUpgrade}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleUpgradeStudents}
              className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeStudents;
