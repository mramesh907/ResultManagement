import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
// Register components
ChartJS.register(ArcElement, Tooltip, Legend)
import React, { useEffect, useState } from "react"
import SummaryApi from "../common/SummaryApi.js" // Adjust the path based on your folder structure
 
const AdminCharts = () => {
  const [semesterCountData, setSemesterCountData] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  useEffect(() => {
    // Fetch data using SummaryApi
    const fetchData = async () => {
      try {
        const [countResponse, performanceResponse] = await Promise.all([
          SummaryApi.getSemesterWiseCount(), // Fetch semester-wise student count
          SummaryApi.getSemesterWisePerformance(), // Fetch semester-wise performance
        ])
        console.log(countResponse)

        setSemesterCountData(countResponse)
        setPerformanceData(performanceResponse)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }

    fetchData()
  }, [])

  // Data for semester-wise student count chart
  const semesterWiseCountChart = {
    labels: semesterCountData.map((item) => `Semester ${item._id}`),
    datasets: [
      {
        label: "Students per Semester",
        data: semesterCountData.map((item) => item.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#90EE90",
        ],
        hoverOffset: 4,
      },
    ],
  }

  // Data for semester-wise performance chart
  const semesterWisePerformanceChart = {
    labels: performanceData.map((item) => `Semester ${item._id}`),
    datasets: [
      {
        label: "Average Marks",
        data: performanceData.map((item) => item.avgMarks),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#90EE90",
        ],
        hoverOffset: 4,
      },
    ],
  }

  return (
    <div className="mt-8">
      {/* Side-by-Side Charts */}
      <div className="flex justify-around flex-wrap gap-4">
        {/* Semester-Wise Student Distribution */}
        <div className="w-full sm:w-1/2 lg:w-2/5">
          <h4 className="text-lg font-medium mb-2 text-center">
            Semester-Wise Student Distribution
          </h4>
          <Pie data={semesterWiseCountChart} />
        </div>

        {/* Semester-Wise Performance */}
        <div className="w-full sm:w-1/2 lg:w-2/5">
          <h4 className="text-lg font-medium mb-2 text-center">
            Semester-Wise Performance
          </h4>
          <Pie data={semesterWisePerformanceChart} />
        </div>
      </div>
    </div>
  )
}

export default AdminCharts
