import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPDF from "./ReportPDF";

const ReportGenerator = ({ jobs }) => {
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const generateReportData = () => {
    if (!selectedReport || !dateRange.start || !dateRange.end) {
      return null;
    }

    const filteredJobs = jobs.filter(
      (job) =>
        new Date(job.date) >= new Date(dateRange.start) &&
        new Date(job.date) <= new Date(dateRange.end)
    );

    const generateMonthlyRevenueReport = (filteredJobs) => {
      const monthlyRevenue = filteredJobs.reduce((acc, job) => {
        const month = new Date(job.date).getMonth();
        acc[month] = (acc[month] || 0) + parseFloat(job.price || 0);
        return acc;
      }, {});
      return { type: "Monthly Revenue", data: monthlyRevenue };
    };

    const generateJobCompletionRateReport = (filteredJobs) => {
      const totalJobs = filteredJobs.length;
      const completedJobs = filteredJobs.filter((job) => job.completed).length;
      const completionRate =
        totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
      return {
        type: "Job Completion Rate",
        data: {
          total: totalJobs,
          completed: completedJobs,
          rate: completionRate,
        },
      };
    };

    switch (selectedReport) {
      case "monthly-revenue":
        return generateMonthlyRevenueReport(filteredJobs);
      case "job-completion-rate":
        return generateJobCompletionRateReport(filteredJobs);
      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Generate Reports</h2>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-auto"
        >
          <option value="">Select a report</option>
          <option value="monthly-revenue">Monthly Revenue</option>
          <option value="job-completion-rate">Job Completion Rate</option>
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
          className="border rounded px-2 py-1 w-full sm:w-auto"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
          className="border rounded px-2 py-1 w-full sm:w-auto"
        />
      </div>
      {selectedReport && dateRange.start && dateRange.end && (
        <PDFDownloadLink
          document={<ReportPDF reportData={generateReportData()} />}
          fileName={`${selectedReport}-report.pdf`}
        >
          {({ blob, url, loading, error }) => (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Generating report..." : "Download Report"}
            </button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default ReportGenerator;
