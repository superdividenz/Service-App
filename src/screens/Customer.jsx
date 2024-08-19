import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid"; // Import the uuid library

const AddData = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchname, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

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

  const handleJobClick = (job) => {
    setSelectedJob(job);
    Object.keys(job).forEach((key) => {
      setValue(key, job[key]);
    });
  };

  const onSubmit = async (data) => {
    if (!selectedJob) return;

    const db = getFirestore();
    const jobDocRef = doc(db, "jobs", selectedJob.id);

    try {
      await updateDoc(jobDocRef, data);
      alert("Job updated successfully");
      reset();
      setSelectedJob(null);
      setMatchingJobs([]); // Clear matching jobs after update
    } catch (error) {
      console.error("Error updating job: ", error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log("Parsed CSV data:", results.data); // Log parsed data
        const db = getFirestore();

        for (const row of results.data) {
          try {
            // Generate a unique ID if 'id' is missing
            const docId = row.id || uuidv4();
            const docRef = doc(db, "jobs", docId);
            await setDoc(docRef, { ...row, id: docId }); // Store ID in the document
          } catch (error) {
            console.error(
              "Error adding job from CSV:",
              error.message,
              error.stack
            );
          }
        }
        alert("CSV data uploaded successfully");
        setMatchingJobs([]); // Clear matching jobs after upload
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
      },
    });
  };

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

  const handleAddJob = async (data) => {
    const db = getFirestore();
    const docId = uuidv4(); // Generate a unique ID for the new job
    const docRef = doc(db, "jobs", docId);

    try {
      await setDoc(docRef, { ...data, id: docId }); // Store ID in the document
      alert("Job added successfully");
      setIsModalOpen(false); // Close the modal after adding the job
      reset(); // Reset the form fields
    } catch (error) {
      console.error("Error adding job: ", error);
    }
  };
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
                {job.name}
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
              type="Price"
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
            onClick={() => setIsModalOpen(true)} // Open the modal on click
            className="bg-purple-500 text-white px-4 py-3 mt-4 rounded-md hover:bg-purple-600 transition duration-200 w-full"
          >
            Add Job Manually
          </button>
        </div>
      </div>

      {/* Modal for adding a job manually */}
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
              <textarea
                {...register("price", { required: true })}
                placeholder="price"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("info", { required: true })}
                placeholder="info"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)} // Close the modal
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
