import react from "react"
const CompareStudent = ({ comparisonData }) => {
  return (
    <>
      {comparisonData && comparisonData.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4 text-blue-700">
            Comparison Results:
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 rounded-lg shadow-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Paper Name
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Student 1 Total Marks
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Student 2 Total Marks
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Marks Difference
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((paper, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="border border-gray-200 px-4 py-2">
                      {paper.paperName}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {paper.student1TotalMarks}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {paper.student2TotalMarks}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {paper.marksDifference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-500 text-center">
          No comparison data available.
        </p>
      )}
    </>
  )
}

export default CompareStudent