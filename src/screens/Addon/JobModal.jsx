// JobModal.jsx
import React from "react";
import Modal from "./Modal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaFileDownload } from "react-icons/fa";
import InvoicePDF from "./InvoicePDF";

const JobModal = ({ job, onClose, onDownload, downloadedJobs }) => {
  return (
    <Modal onClose={onClose}>
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{job.name}</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <p>
            <span className="font-semibold">Date:</span> {job.date || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {job.email || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {job.phone || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Price:</span> ${job.price || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {job.address || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Status:</span> Completed
          </p>
        </div>
        <p className="mb-4">
          <span className="font-semibold">Info:</span> {job.info || "N/A"}
        </p>
        <PDFDownloadLink
          document={<InvoicePDF job={job} />}
          fileName={`invoice_${job.name}.pdf`}
          className={`inline-flex items-center px-4 py-2 rounded transition duration-300 ${
            downloadedJobs.has(job.id)
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={() => onDownload(job.id)}
        >
          {({ blob, url, loading, error }) =>
            loading ? (
              "Generating Invoice..."
            ) : (
              <>
                <FaFileDownload className="mr-2" />
                {downloadedJobs.has(job.id)
                  ? "Invoice Downloaded"
                  : "Download Invoice"}
              </>
            )
          }
        </PDFDownloadLink>
      </div>
    </Modal>
  );
};

export default JobModal;
