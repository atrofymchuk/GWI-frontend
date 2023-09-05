import React, { useRef, useState } from "react";
import BackButton from "../Shared/BackButton";
import { useStepsContext } from "../../Context/StateContext";
import Loading from "../Shared/Loading";
import * as XLSX from "xlsx"; // Import the xlsx library

const Step2 = () => {
  const fileInputRef = useRef(null);
  const { processing, setProcessing, setStep, rows, setRows } =
    useStepsContext();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileProgress, setFileProgress] = useState({});

  const processDataFromFiles = async () => {
    try {
      // console.log("selectedFiles: ", selectedFiles  );

      for (const file of selectedFiles) {
        // console.log("files: ", file);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            // Process the rows from the sheet (console.log or store the data as needed)
            console.log(`File: ${file.name}, Sheet: ${sheetName}`);
            console.log(typeof rows);
            setRows(rows);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("Error processing data:", error);
    }
  };

  const handleFileChange = (event) => {
    console.log("Hello");
    const newSelectedFiles = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...newSelectedFiles]);

    newSelectedFiles.forEach((file) => {
      setFileProgress((prevProgress) => ({
        ...prevProgress,
        [file.name]: 0,
      }));

      simulateFileUploadProgress(file);
    });
  };

  const simulateFileUploadProgress = (file) => {
    let progress = 0;

    const interval = setInterval(() => {
      if (progress < 100) {
        progress += 10;
        setFileProgress((prevProgress) => ({
          ...prevProgress,
          [file.name]: progress,
        }));
      } else {
        clearInterval(interval); // Clear the interval when progress reaches 100%
      }
    }, 200);
  };

  const handleDeleteFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
    setFileProgress((prevProgress) => {
      const updatedProgress = { ...prevProgress };
      delete updatedProgress[fileName];
      return updatedProgress;
    });
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileConfirm = () => {
    setProcessing(true);
    processDataFromFiles();
    setTimeout(() => {
      setStep("all_reports");
      setProcessing(false);
    }, 2000);
  };

  return (
    <>
      {processing ? (
        <Loading title="Please wait, data source is being processed" />
      ) : (
        <div className="pb-10">
          <BackButton setStep={() => setStep("step1")} />
          <div className="grid w-full min-h-[75vh] ">
            <div className="w-1/2 mx-auto flex justify-center items-center flex-col">
              <h1 className="text-[#000] font-bold text-3xl mb-1">
                Identify potential Greenwashing on the fly
              </h1>
              <p className="text-[#0000007f] text-lg font-semibold mb-7">
                Download the data source file to get started
              </p>
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <img
                  src="/assets/file_upload.svg"
                  alt="file"
                  className="cursor-pointer"
                  onClick={handleFileClick}
                />
              </div>
              {/* File Progress */}
              {selectedFiles.map((file) => (
                <div
                  key={file.name}
                  className="grid grid-cols-[70px,70%,70px] w-[75%] mx-auto rounded-xl border-[2px] border-[#E8ECEF] mt-10 p-3 justify-center"
                >
                  <div className="">
                    <img
                      src="/assets/file.svg"
                      alt="logo"
                      className="mx-auto"
                    />
                  </div>
                  <div className="">
                    <h1 className="font-semibold mb-0 text-[#000]">
                      {file.name}
                    </h1>
                    <p className="font-semibold mt-0 text-sm text-[#808080]">
                      {Math.round(file.size / 1024)} KB
                    </p>
                    <div className="bg-gray-200 h-3 rounded-full overflow-hidden w-full mt-2">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${fileProgress[file.name] || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="">
                    <img
                      onClick={() => handleDeleteFile(file.name)}
                      src="/assets/delete.svg"
                      alt="logo"
                      className="mx-auto cursor-pointer"
                    />
                    <p className="text-center mt-2 text-base">
                      {fileProgress[file.name] || 0}%
                    </p>
                  </div>
                </div>
              ))}
              <button
                onClick={handleFileConfirm}
                className="bg-[#3FDD78] text-lg rounded-2xl mt-10 py-3 px-6 border-none outline-none text-[#fff] "
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Step2;