import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/Header.jsx";
import { useAppStore } from "../../store/adminStore.js";
import toast from "react-hot-toast";

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader, Search, Trash, Edit } from "lucide-react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const AddTeacherPage = () => {
  const [state, setState] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [password, setPassword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [availableClasses, setAvailableClasses] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const dialogRef = useRef(null);

  const {
    getClassesAndSubjects,
    addTeacher,
    isLoading,
    getAllTeachers,
    deleteTeacher,
    updateTeacher,
  } = useAppStore();

  const [colDefs, setColDefs] = useState([
    {
      headerName: "id",
      valueGetter: (params) => params.node.rowIndex + 1,
    },
    { field: "firstName", filter: true },
    { field: "secondName", filter: true },
    { field: "email", filter: true },
    { field: "role", filter: true },
    {
      headerName: "Action",
      cellRenderer: (params) => {
        const teacher = params.data;
        return (
          <div className="flex items-center gap-3 justify-center h-full">
            <button
              onClick={() => handleDelete(teacher.email)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash size={18} />
            </button>
            <button
              onClick={() => handleEdit(teacher)}
              className="text-[#6c62ff] hover:text-[#5b52ff]"
            >
              <Edit size={18} />
            </button>
          </div>
        );
      },
      width: 120,
    },
  ]);

  const [rowData, setRowData] = useState([]);

  // open/close modal
  useEffect(() => {
    if (state) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [state]);

  // fetch classes + subjects
  useEffect(() => {
    const fetchClassesAndSubjects = async () => {
      try {
        const data = await getClassesAndSubjects();
        console.log("Fetched:", data);
        setAvailableClasses(data.classes || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClassesAndSubjects();
  }, [getClassesAndSubjects]);

  // Add new class block
  const handleAddClass = () => {
    setTeacherClasses([
      ...teacherClasses,
      { class_Id: "", assignedSubjects: [] }, // Removed customSubjects
    ]);
  };

  // Handle class select
  const handleClassChange = (index, class_Id) => {
    const updated = [...teacherClasses];
    updated[index].class_Id = class_Id;
    updated[index].assignedSubjects = []; // reset assigned subjects when changing class
    setTeacherClasses(updated);
  };

  // Toggle subject checkbox
  const handleToggleSubject = (classIndex, subjectId) => {
    const updated = [...teacherClasses];
    const selected = updated[classIndex].assignedSubjects;

    if (selected.includes(subjectId)) {
      updated[classIndex].assignedSubjects = selected.filter(
        (id) => id !== subjectId
      );
    } else {
      updated[classIndex].assignedSubjects.push(subjectId);
    }

    setTeacherClasses(updated);
  };

  // Get available subjects for a class, filtering out those already assigned to other teachers
  const getAvailableSubjectsForClass = (
    classId,
    currentTeacherEmail = null
  ) => {
    const selectedClass = availableClasses.find(
      (cls) => cls._id.toString() === classId
    );
    if (!selectedClass) return [];

    // Get all subject IDs that are already assigned to other teachers
    const assignedSubjectIds = new Set();
    allTeachers.forEach((teacher) => {
      // Skip the current teacher being edited
      if (currentTeacherEmail && teacher.email === currentTeacherEmail) return;

      if (teacher.subjectIds) {
        teacher.subjectIds.forEach((subjectId) => {
          assignedSubjectIds.add(subjectId.toString());
        });
      }
    });

    // Filter out subjects that are already assigned to other teachers
    return selectedClass.subjectIds.filter(
      (subject) => !assignedSubjectIds.has(subject._id.toString())
    );
  };

  const [isEditing, setIsEditing] = useState(false);
  const [originalEmail, setOriginalEmail] = useState(null);

  const handleDelete = async (email) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      const res = await deleteTeacher(email);
      if (res.success) {
        toast.success("Teacher deleted successfully");
        const data = await getAllTeachers();
        setRowData(data.teachers || []);
        setAllTeachers(data.teachers || []);
      } else {
        toast.error(res.message || "Failed to delete teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete teacher");
    }
  };

  const handleEdit = (teacher) => {
    setIsEditing(true);
    setOriginalEmail(teacher.email);
    setEmail(teacher.email);
    setFirstName(teacher.firstName || "");
    setSecondName(teacher.secondName || "");

    // Map teacher's classes and subjects to form state
    const classesArr = teacher.classes || [];
    const subjectIds = teacher.subjectIds || [];

    const newTeacherClasses = classesArr.map((clsId) => {
      const cls = availableClasses.find(
        (c) => c._id.toString() === clsId.toString()
      );
      const clsSubjectIds = cls
        ? cls.subjectIds.map((s) => s._id.toString())
        : [];
      const assigned = subjectIds.filter((sId) =>
        clsSubjectIds.includes(sId.toString())
      );

      return { class_Id: clsId.toString(), assignedSubjects: assigned };
    });

    setTeacherClasses(newTeacherClasses);
    setState(true);
  };

  // Handle submit (handles both add and edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Collect all selected class IDs
    const classes = teacherClasses
      .map((c) => c.class_Id)
      .filter((id) => id.trim() !== "");

    // Collect all assigned subject IDs (flattened)
    const subjectIds = teacherClasses.flatMap((c) => c.assignedSubjects);

    if (isEditing) {
      const payload = {
        email: originalEmail,
        firstName,
        secondName,
        classes,
        subjectIds,
      };
      try {
        const data = await updateTeacher(payload);
        if (data.success) {
          toast.success("Teacher updated successfully");
          setState(false);
          setIsEditing(false);
          setOriginalEmail(null);
          setEmail("");
          setFirstName("");
          setSecondName("");
          setPassword("");
          setTeacherClasses([]);
          const teachersData = await getAllTeachers();
          setRowData(teachersData.teachers || []);
          setAllTeachers(teachersData.teachers || []);
        } else {
          toast.error(data.message || "Failed to update teacher");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update teacher");
      }
      return;
    }

    const payload = {
      email,
      firstName,
      secondName,
      password,
      classes,
      subjectIds,
    };
    try {
      const data = await addTeacher(payload);
      if (data.success === true) {
        toast.success("Teacher added successfully");
        setState(false);
        setEmail("");
        setFirstName("");
        setSecondName("");
        setPassword("");
        setTeacherClasses([]);
        const teachersData = await getAllTeachers();
        setRowData(teachersData.teachers || []);
        setAllTeachers(teachersData.teachers || []);
      }
    } catch (error) {
      console.log("Error adding teacher:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const data = await getAllTeachers();
        setRowData(data.teachers || []);
        setAllTeachers(data.teachers || []);
      } catch (error) {
        console.log("Error fetching teachers:", error);
        toast.error("Error fetching teachers");
      }
    };

    fetchAllTeachers();
  }, [getAllTeachers]);

  return (
    <div>
      <Header setState={setState} name={"Teacher"} />

      {/* Modal */}
      <dialog
        ref={dialogRef}
        className="p-6 rounded-lg w-[650px] overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-2xl font-semibold mb-4">Add Teacher</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Second Name</label>
            <input
              type="text"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              placeholder="Enter second name"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
              required={!isEditing}
            />
          </div>

          {/* CLASSES + SUBJECTS */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Assign Classes & Subjects</h3>
              <button
                type="button"
                onClick={handleAddClass}
                className="bg-indigo-500 text-white px-3 py-2 rounded-lg"
              >
                + Add Class
              </button>
            </div>

            {teacherClasses.map((classItem, classIndex) => {
              const selectedClass = availableClasses.find(
                (cls) => cls._id.toString() === classItem.class_Id
              );

              return (
                <div
                  key={classIndex}
                  className="border p-3 mb-3 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold">Class</label>
                    <button
                      type="button"
                      onClick={() => handleRemoveClass(classIndex)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <select
                    value={classItem.class_Id}
                    onChange={(e) =>
                      handleClassChange(classIndex, e.target.value)
                    }
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="">Select Class</option>
                    {availableClasses.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>

                  {/* AUTO SUBJECTS */}
                  {selectedClass && (
                    <div className="ml-2 mb-3">
                      <label className="font-semibold block mb-1">
                        Available Subjects
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {getAvailableSubjectsForClass(
                          selectedClass._id,
                          isEditing ? originalEmail : null
                        ).map((subj) => (
                          <label
                            key={subj._id}
                            className="flex items-center gap-1 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={classItem.assignedSubjects.includes(
                                subj._id
                              )}
                              onChange={() =>
                                handleToggleSubject(classIndex, subj._id)
                              }
                            />
                            {subj.name}
                          </label>
                        ))}
                        {getAvailableSubjectsForClass(
                          selectedClass._id,
                          isEditing ? originalEmail : null
                        ).length === 0 && (
                          <p className="text-sm text-gray-500 italic">
                            All subjects in this class are already assigned to
                            other teachers.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              disabled={isLoading}
              type="button"
              onClick={() => {
                setState(false);
                setIsEditing(false);
                setOriginalEmail(null);
                setEmail("");
                setFirstName("");
                setSecondName("");
                setPassword("");
                setTeacherClasses([]);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-[#6c62ff] text-white px-6 py-2 rounded-lg"
            >
              {isLoading ? "Submitting..." : isEditing ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </dialog>

      <div className="w-96 flex gap-4 p-2 items-center">
        <Search />
        <input
          type="text"
          onChange={(e) => setSearchInput(e.target.value)}
          className="py-2 px-8 outline-none border rounded focus:border-gray-400"
          placeholder="Search..."
        />
      </div>

      <div className="" style={{ height: 490 }}>
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            {" "}
            <Loader className="animate-spin text-[#6c62ff]" />
          </div>
        ) : (
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={20}
            quickFilterText={searchInput}
          />
        )}
      </div>
    </div>
  );
};

export default AddTeacherPage;
