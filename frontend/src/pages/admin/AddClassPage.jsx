import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useAppStore } from "../../store/adminStore.js";
import Header from "../../components/Header";
import { Loader, Search, Trash, Edit } from "lucide-react";
import Button from "../../components/Button";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const AddClassPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(id);
        toast.success("Class deleted successfully");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleEdit = (classData) => {
    setEditingId(classData._id);
    setIsEditing(true);
    setName(classData.name);
    setSubjects(classData.subjectIds.map((subject) => subject.name));
    setState(true); 
  };

  const [state, setState] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");

  const [inputValue, setInputValue] = useState("");
  const dialogRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");
  const [rowData, setRowData] = useState([]);

  const [colDefs, setColDefs] = useState([
    {
      headerName: "id",
      valueGetter: (params) => {
        return params.node.rowIndex + 1;
      },
    },
    { field: "name", filter: true },
    {
      field: "createdAt",
      headerName: "Created At",
      valueGetter: (params) => {
        const date = new Date(params.data.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      field: "updatedAt",
      headerName: "updatedAt",
      valueGetter: (params) => {
        const date = new Date(params.data.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      headerName: "Subjects",
      field: "subjectIds",
      valueGetter: (params) => {
        return params.data.subjectIds.map((subject) => subject.name).join(", ");
      },
    },
    {
      headerName: "Action",
      cellRenderer: (params) => {
        const classData = params.data;
        return (
          <div className="flex items-center gap-3 justify-center  h-full">
            <button
              onClick={() => handleDelete(classData._id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash size={18} />
            </button>
            <button
              onClick={() => handleEdit(classData)}
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

  const { isLoading, addClass, getClasses, deleteClass, updateClass } = useAppStore();

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
        const classes = await getClasses();

        setRowData(classes.classes);
      } catch (error) {
        console.log("Error fetching classes:", error);
        toast.error(error.message);
      }
    };

    fetchClasses();
  }, [getClasses]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (subjects.length === 0) return toast.error("All fields are required");

    const payload = {
      name: name.toUpperCase(),
      subjectIds: subjects,
    };

    try {
      let response;
      if (isEditing && editingId) {
        response = await updateClass({ id: editingId, ...payload });
        if (response.success) {
          toast.success("Class updated successfully");
         
          getClasses().then((data) => setRowData(data.classes));
          setIsEditing(false);
          setEditingId(null);
        }
      } else {
        response = await addClass(payload);
        if (response.success) {
          toast.success("Class added successfully");
          setRowData((prevData) => [...prevData, response.class]);
        }
      }

      if (!response.success) {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setState(false);
      setInputValue("");
      setSubjects([]);
      setName("");
    }
  };

  const handleAddSubject = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newSubject = inputValue.trim();
      if (newSubject && !subjects.includes(newSubject)) {
        setSubjects([...subjects, newSubject]);
        setInputValue("");
      }
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter((subject) => subject !== subjectToRemove));
  };

  return (
    <div>
      <Header setState={setState} name={"Class"} />
      <dialog
        ref={dialogRef}
        className="p-6 rounded-lg w-[600px] overflow-y-hidden"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {isEditing ? "Edit Class" : "Add Class"}
        </h2>
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label
              htmlFor="secondName"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter class name"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="subjectsInput"
              className="block text-sm font-medium text-gray-700"
            >
              Subjects
            </label>
            <div className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 flex flex-wrap items-center gap-2">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="ml-1 -mr-0.5 inline-flex items-center justify-center p-0.5 rounded-full hover:bg-indigo-200"
                    aria-label={`Remove ${subject}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <input
                type="text"
                id="subjectsInput"
                placeholder="Type a subject and press Enter"
                className="flex-grow p-0 border-none outline-none focus:ring-0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAddSubject}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => setState(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
            <button
              disabled={isLoading}
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

export default AddClassPage;
