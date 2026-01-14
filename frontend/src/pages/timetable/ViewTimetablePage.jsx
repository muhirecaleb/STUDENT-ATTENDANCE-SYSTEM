import React, { useState, useEffect } from "react";
import { useTimetableStore } from "../../store/timetableStore";
import { authStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import { FileText, Download, Loader, Calendar, Eye, X } from "lucide-react";
import TeacherHeader from "../../components/TeacherHeader";

const ViewTimetablePage = () => {
  const { user } = authStore();
  const { timetables, isLoading, getMyTimetables } = useTimetableStore();
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getMyTimetables();
  }, [getMyTimetables]);

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (timetable) => {
    setSelectedTimetable(timetable);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTimetable(null);
  };

  const renderTimetableContent = (timetable) => {
    if (!timetable) return null;

    const extension = timetable.fileName.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png"].includes(extension)) {
      return (
        <img
          src={timetable.fileUrl}
          alt={timetable.title}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            console.error("Image failed to load:", e);
            e.target.style.display = "none";
          }}
          onLoad={() => console.log("Image loaded successfully")}
        />
      );
    } else if (extension === "pdf") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              PDF Preview Not Available
            </h3>
            <p className="text-gray-600 mb-4">
              PDFs cannot be previewed directly in the browser due to security
              restrictions.
            </p>
            <div className="space-y-2">
              <a
                href={timetable.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Open PDF in New Tab
              </a>
              <br />
              <button
                onClick={() =>
                  handleDownload(timetable.fileUrl, timetable.fileName)
                }
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors mt-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Optional: Try to embed PDF anyway for browsers that support it */}
          <div className="w-full max-w-2xl">
            <p className="text-sm text-gray-500 mb-2">
              Trying to embed PDF (may not work in all browsers):
            </p>
            <div className="border rounded-lg overflow-hidden bg-gray-100">
              <object
                data={timetable.fileUrl}
                type="application/pdf"
                width="100%"
                height="400px"
                className="border-0"
              >
                <p className="p-4 text-center text-gray-500">
                  Your browser doesn't support PDF embedding.
                  <br />
                  <a
                    href={timetable.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Click here to open the PDF
                  </a>
                </p>
              </object>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            This file type cannot be previewed directly.
            <br />
            Please download to view.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            File: {timetable.fileName}
          </p>
          <p className="text-xs text-gray-400">URL: {timetable.fileUrl}</p>
        </div>
      );
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(extension)) {
      return "📄";
    } else if (["jpg", "jpeg", "png"].includes(extension)) {
      return "🖼️";
    } else if (["doc", "docx"].includes(extension)) {
      return "📝";
    }
    return "📄";
  };

  return (
    <div className="p-4">
      <TeacherHeader name="Timetable" />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading timetables...</span>
          </div>
        ) : timetables.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Timetables Available
            </h3>
            <p className="text-gray-500">
              {user?.role.toLowerCase() === "admin"
                ? "Upload your first timetable to get started."
                : "No timetables have been uploaded yet. Please check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map((timetable) => (
              <div
                key={timetable._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getFileIcon(timetable.fileName)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          {timetable.title}
                        </h3>
                        {timetable.classId && (
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            Class: {timetable.classId.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {timetable.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {timetable.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>
                      Uploaded by: {timetable.uploadedBy?.firstName}{" "}
                      {timetable.uploadedBy?.secondName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(timetable.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(timetable)}
                        className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(timetable.fileUrl, timetable.fileName)
                        }
                        className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing timetable */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTimetable?.title || "Timetable"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              {selectedTimetable?.description && (
                <p className="text-gray-600 mb-4">
                  {selectedTimetable.description}
                </p>
              )}
              <div className="bg-gray-50 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                {selectedTimetable ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Debug Info:</p>
                    <p className="text-xs text-gray-400">
                      File: {selectedTimetable.fileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      URL: {selectedTimetable.fileUrl}
                    </p>
                    <div className="mt-4">
                      {renderTimetableContent(selectedTimetable)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Loading...</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={() =>
                  selectedTimetable &&
                  handleDownload(
                    selectedTimetable.fileUrl,
                    selectedTimetable.fileName
                  )
                }
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimetablePage;
