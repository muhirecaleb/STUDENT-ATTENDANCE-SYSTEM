import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import { toast } from "react-hot-toast";
import { useAppStore } from "../../store/adminStore.js";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import Button from "../../components/Button";
import { Loader, Search, Trash, Edit } from "lucide-react";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const AddStudentPage = () => {
  const DeleteBtn = () => {
    return <Button />;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [colDefs, setColDefs] = useState([
    {
      headerName: "ID",
      valueGetter: (params) => params.node.rowIndex + 1,
    },
    { field: "firstName", filter: true },
    { field: "secondName", filter: true },
    { field: "email", filter: true },
    { field: "role", filter: true },
    {
      headerName: "Action",
      cellRenderer: (params) => {
        const row = params.data;
        return (
          <div className="flex items-center gap-3 justify-center h-full">
            <button
              onClick={async () => handleDelete(row._id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash size={16} />
            </button>
            <button
              onClick={() => handleEdit(row)}
              className="text-[#6c62ff] hover:text-[#5b52ff]"
            >
              <Edit size={16} />
            </button>
          </div>
        );
      },
    },
  ]);

  const [rowData, setRowData] = useState([]);
  const [state, setState] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [classToDisplayStudents, setclassToDisplayStudents] = useState("");

  const {
    addStudent,
    getAllClasses,
    isLoading,
    getStudentsByClass,
    updateStudent,
    deleteStudent,
  } = useAppStore();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (state) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [state]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getAllClasses();
        console.log(data);
        setClasses(data.classes);

        if (data.classes.length > 0) {
          setclassToDisplayStudents(data.classes[0]._id);
        }
      } catch (error) {
        console.log("Error fetching classes:", error);
   toast.error(error.message);
        
      }
    };
    fetchClasses();
  }, [getAllClasses]);

  //fetch students when ever the class changes

  useEffect(() => {
    const fetchStudentsByClass = async () => {
      try {
        const data = await getStudentsByClass(classToDisplayStudents);
        if (data.success) {
          setRowData(data.students || []);
        } else {
          toast.error(data.message || "Error fetching students");
          setRowData([]);
        }
      } catch (error) {
        console.log("Error fetching students:", error);
        toast.error("Failed to load students");
        setRowData([]);
      }
    };

    if (classToDisplayStudents) {
      fetchStudentsByClass();
    } else {
      setRowData([]);
    }
  }, [getStudentsByClass, classToDisplayStudents]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // If adding new student, require all fields; if editing, password is optional
    if (
      !firstName ||
      !secondName ||
      !classId ||
      (!isEditing && (!email || !password))
    ) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      if (isEditing && editingId) {
        const payload = {
          id: editingId,
          email,
          firstName,
          secondName,
          classId,
        };
        if (password) payload.password = password;
        const res = await updateStudent(payload);
        if (res.success) {
          toast.success("Student updated successfully");
          setRowData((prev) =>
            prev.map((r) =>
              r._id === editingId
                ? { ...r, firstName, secondName, email, classId }
                : r
            )
          );
          setIsEditing(false);
          setEditingId(null);
        } else {
          toast.error(res.message || "Failed to update student");
        }
      } else {
        const formData = { email, firstName, secondName, password, classId };
        const data = await addStudent(formData);
        if (data.success === true) {
          toast.success("Student Added!");
        } else {
          toast.error(data.message || "Error adding student.");
        }
      }
    } catch (error) {
      console.error("Error adding/updating student", error);
      toast.error("Error processing request");
    } finally {
      setFirstName("");
      setSecondName("");
      setEmail("");
      setPassword("");
      setClassId("");
      setState(false);
    }
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setEditingId(row._id);
    setFirstName(row.firstName || "");
    setSecondName(row.secondName || "");
    setEmail(row.email || "");
    setClassId(row.classId || classToDisplayStudents || "");
    setState(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      const res = await deleteStudent(id);
      if (res.success) {
        setRowData((prev) => prev.filter((r) => r._id !== id));
        toast.success("Student deleted");
      } else {
        toast.error(res.message || "Failed to delete student");
      }
    } catch (err) {
      toast.error("Error deleting student");
    }
  };

  return (
    <div>
      <Header setState={setState} name={"Student"} />

      {/* Dialog component */}
      <dialog
        ref={dialogRef}
        className="p-6 rounded-lg w-[600px] overflow-y-hidden"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {isEditing ? "Edit Student" : "Add Student"}
        </h2>
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Track email field
              placeholder="Enter email"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* First Name Input */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)} // Track firstName field
              placeholder="Enter first name"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Second Name Input */}
          <div>
            <label
              htmlFor="secondName"
              className="block text-sm font-medium text-gray-700"
            >
              Second Name
            </label>
            <input
              type="text"
              id="secondName"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)} // Track secondName field
              placeholder="Enter second name"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Track password field
              placeholder={
                isEditing ? "Enter new password (optional)" : "Enter password"
              }
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={!isEditing}
            />
          </div>

          {/* Class Selection */}
          <div>
            <label
              htmlFor="classId"
              className="block text-sm font-medium text-gray-700"
            >
              Classes
            </label>
            <select
              id="classId"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a class</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => setState(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-[#6c62ff] text-white px-6 py-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : isEditing ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </dialog>

      <div className="flex justify-between">
        <div className="w-96 flex gap-4 p-2 items-center">
          <Search />
          <input
            type="text"
            onChange={(e) => setSearchInput(e.target.value)}
            className="py-2 px-8 outline-none border rounded focus:border-gray-400"
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center">
          <p className="text-nowrap mr-3 text-gray-700">Filter by class</p>
          <select
            name="class"
            id="class"
            value={classToDisplayStudents}
            onChange={(e) => setclassToDisplayStudents(e.target.value)}
            className="mt-1 w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-indigo-50"
          >
            {classes.map((item) => (
              <option key={item._id} value={item._id} className="text-gray-900">
                {item.name}
              </option>
            ))}
          </select>
        </div>
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

export default AddStudentPage;
