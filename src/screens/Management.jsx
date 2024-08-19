import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import JobCard from "./Addon/JobCard";
import JobModal from "./Addon/JobModal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./Addon/InvoicePDF";
import ReportGenerator from "./Addon/ReportGenerator";

const Management = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedJobsValue, setCompletedJobsValue] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState(new Set());

  const companyInfo = {
    name: "Wegener Asphalt",
    address: "123 Main St, Anytown, ST 12345",
    phone: "(123) 456-7890",
    logoUrl: "/path/to/your/logo.png",
  };

  const fetchJobs = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    const jobsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const completedJobs = jobsData.filter((job) => job.completed);
    setJobs(completedJobs);

    const completedValue = completedJobs.reduce(
      (sum, job) => sum + parseFloat(job.price || 0),
      0
    );
    setCompletedJobsValue(completedValue);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleDownload = (job) => {
    setShowNotification(true);
    setDownloadedJobs((prev) => new Set(prev).add(job.id));
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Completed Jobs
      </h1>
      <p className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
        Total value of completed jobs: ${completedJobsValue.toFixed(2)}
      </p>

      {jobs.length === 0 ? (
        <p className="text-gray-600 text-center">No completed jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobClick={handleJobClick}
              onDownload={() => handleDownload(job)}
              downloadedJobs={downloadedJobs}
              pdfDownloadLink={
                <PDFDownloadLink
                  document={<InvoicePDF job={job} companyInfo={companyInfo} />}
                  fileName={`invoice-${job.id}.pdf`}
                >
                  {({ blob, url, loading, error }) => (
                    <button
                      onClick={() => handleDownload(job)}
                      className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
                        downloadedJobs.has(job.id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white`}
                      disabled={downloadedJobs.has(job.id)}
                    >
                      {downloadedJobs.has(job.id)
                        ? "Downloaded"
                        : "Download Invoice"}
                    </button>
                  )}
                </PDFDownloadLink>
              }
            />
          ))}
        </div>
      )}

      <ReportGenerator jobs={jobs} />

      {isModalOpen && selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={handleCloseModal}
          onDownload={() => handleDownload(selectedJob)}
          downloadedJobs={downloadedJobs}
          pdfDownloadLink={
            <PDFDownloadLink
              document={
                <InvoicePDF job={selectedJob} companyInfo={companyInfo} />
              }
              fileName={`invoice-${selectedJob.id}.pdf`}
            >
              {({ blob, url, loading, error }) => (
                <button
                  onClick={() => handleDownload(selectedJob)}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
                    downloadedJobs.has(selectedJob.id)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  disabled={downloadedJobs.has(selectedJob.id)}
                >
                  {downloadedJobs.has(selectedJob.id)
                    ? "Downloaded"
                    : "Download Invoice"}
                </button>
              )}
            </PDFDownloadLink>
          }
        />
      )}

      {showNotification && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg text-sm sm:text-base">
          Invoice downloaded successfully!
        </div>
      )}
    </div>
  );
};

export default Management;
