import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, setDoc } from "firebase/firestore";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

const AddData = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchname, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle search input to filter jobs
  const handleSearch = async (e) => {
    const input = e.target.value;
    setSearchLastName(input);

    if (input.length > 0) {
      const db = getFirestore();
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("name", ">=", input),
        where("name", "<=", input + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatchingJobs(jobsData);
    } else {
      setMatchingJobs([]);
    }
  };

  // Set selected job details in form
  const handleJobClick = (job) => {
    setSelectedJob(job);
    Object.keys(job).forEach((key) => {
      setValue(key, key === "date" ? formatDateForInput(job[key]) : job[key]);
    });
  };

  // Format date from MM/DD/YYYY to YYYY-MM-DD for input, or leave as is if invalid
  const formatDateForInput = (dateStr) => {
    if (!dateStr || !dateStr.includes("/")) return dateStr;
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Format date from YYYY-MM-DD to MM/DD/YYYY for storage
  const formatDateForStorage = (dateStr) => {
    if (!dateStr || !dateStr.includes("-")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  // Handle the form submission for updating the job details
  const onSubmit = async (data) => {
    if (!selectedJob) return;

    const db = getFirestore();
    const jobDocRef = doc(db, "jobs", selectedJob.id);

    try {
      const updatedData = {
        ...data,
        date: formatDateForStorage(data.date),
        completed: selectedJob.completed || false, // Preserve completed status
      };
      await updateDoc(jobDocRef, updatedData);
      alert("Job updated successfully");
      reset();
      setSelectedJob(null);
      setMatchingJobs([]);
    } catch (error) {
      console.error("Error updating job: ", error);
    }
  };

  // Handle file upload and parse CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log("Parsed CSV data:", results.data);
        const db = getFirestore();

        for (const row of results.data) {
          try {
            const docId = row.id || uuidv4();
            const formattedRow = {
              ...row,
              date: formatDateForStorage(row.date),
              completed: row.completed === "true" || false,
              id: docId,
            };
            const docRef = doc(db, "jobs", docId);
            await setDoc(docRef, formattedRow);
          } catch (error) {
            console.error("Error adding job from CSV:", error.message, error.stack);
          }
        }
        alert("CSV data uploaded successfully");
        setMatchingJobs([]);
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
      },
    });
  };

  // Handle downloading the jobs data as CSV
  const handleDownload = () => {
    const csv = Papa.unparse(matchingJobs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "jobs_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle adding a job manually
  const handleAddJob = async (data) => {
    const db = getFirestore();
    const docId = uuidv4();
    const docRef = doc(db, "jobs", docId);

    try {
      const newJob = {
        ...data,
        date: formatDateForStorage(data.date),
        completed: false,
        id: docId,
      };
      await setDoc(docRef, newJob);
      alert("Job added successfully");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Error adding job: ", error);
    }
  };

  // Close modal when clicking outside
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        Customer
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          value={searchname}
          onChange={handleSearch}
          placeholder="Search by Name"
          className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        {matchingJobs.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {matchingJobs.map((job) => (
              <li
                key={job.id}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <span className="font-medium text-gray-700">{job.name}</span> -{" "}
                {job.date}
              </li>
            ))}
          </ul>
        )}
        {selectedJob && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-700">
              Edit Job Details
            </h3>

            <input
              {...register("name", { required: true })}
              placeholder="Name"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("email", { required: true })}
              placeholder="Email"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("phone", { required: true })}
              placeholder="Phone"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("address", { required: true })}
              placeholder="Address"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("date", { required: true })}
              type="date"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("price", { required: true })}
              placeholder="Price"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              {...register("info", { required: true })}
              placeholder="Info"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition duration-200 w-full"
            >
              Update
            </button>
          </form>
        )}
        <div className="mt-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-3 mt-4 rounded-md hover:bg-blue-600 transition duration-200 w-full"
          >
            Download Data
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 text-white px-4 py-3 mt-4 rounded-md hover:bg-purple-600 transition duration-200 w-full"
          >
            Add Job Manually
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Add New Job
            </h3>
            <form onSubmit={handleSubmit(handleAddJob)} className="space-y-4">
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("email", { required: false })}
                placeholder="Email"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("phone", { required: true })}
                placeholder="Phone"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("address", { required: true })}
                placeholder="Address"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("date", { required: true })}
                type="date"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("price", { required: true })}
                placeholder="Price"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("info", { required: true })}
                placeholder="Info"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddData;