import React, { useState, useEffect } from "react";
import { useTimetableStore } from "../../store/timetableStore";
import { authStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import { Upload, FileText, Trash2, Download, Loader } from "lucide-react";
import TeacherHeader from "../../components/TeacherHeader";

const TimetablePage = () => {
  const { user } = authStore();
  const {
    timetables,
    isLoading,
    uploadTimetable,
    getTimetables,
    deleteTimetable,
  } = useTimetableStore();

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    classId: "",
    file: null,
  });

  useEffect(() => {
    getTimetables();
  }, [getTimetables]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.title || !uploadForm.file) {
      toast.error("Title and file are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("classId", uploadForm.classId);
    formData.append("timetable", uploadForm.file);

    const result = await uploadTimetable(formData);

    if (result.success) {
      toast.success("Timetable uploaded successfully");
      setUploadForm({
        title: "",
        description: "",
        classId: "",
        file: null,
      });
      getTimetables(); // Refresh the list
    } else {
      toast.error(result.message || "Failed to upload timetable");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this timetable?")) {
      const result = await deleteTimetable(id);
      if (result.success) {
        toast.success("Timetable deleted successfully");
        getTimetables(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to delete timetable");
      }
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <TeacherHeader name="Timetable Management" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Upload Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upload Timetable</h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter timetable title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File *
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6c62ff] hover:opacity-95 text-white py-2 px-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload Timetable
            </button>
          </form>
        </div>

        {/* Timetables List */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Uploaded Timetables</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : timetables.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No timetables uploaded yet
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timetables.map((timetable) => (
                <div
                  key={timetable._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {timetable.title}
                      </h3>
                      {timetable.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {timetable.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Uploaded by: {timetable.uploadedBy?.firstName}{" "}
                          {timetable.uploadedBy?.secondName}
                        </span>
                        <span>
                          {new Date(timetable.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() =>
                          handleDownload(timetable.fileUrl, timetable.fileName)
                        }
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(timetable._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
