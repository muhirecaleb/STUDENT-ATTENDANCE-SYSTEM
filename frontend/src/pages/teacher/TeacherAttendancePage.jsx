import React, { useState, useEffect, useMemo, useRef } from "react";
import TeacherHeader from "../../components/TeacherHeader";
import useTeacherStore from "../../store/teacherStore.js";
import toast from "react-hot-toast";

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader } from "lucide-react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const CheckboxCellRenderer = React.memo((props) => {
  const { value, data, colDef } = props;

  const [isChecked, setIsChecked] = useState(value);

  useEffect(() => {
    setIsChecked(value);
  }, [value]);

  const handleChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    props.node.setData({ ...props.data, isPresent: newCheckedState });
  };

  return (
    <div className="flex justify-center items-center h-full">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="cursor-pointer h-4 w-4 text-[#6c62ff] border-gray-300 rounded focus:ring-[#6c62ff]"
      />
    </div>
  );
});

const INPUT_STYLE =
  "p-2 bg-gray-100 text-gray-700 rounded-md border-2 border-[#6c62ff] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto transition duration-150";

const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef();
  const [colDefs, setColDefs] = useState([
    {
      headerName: "#",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 70,
    },
    { field: "firstName", headerName: "First Name", filter: true, width: 150 },
    {
      field: "secondName",
      headerName: "Second Name",
      filter: true,
      width: 150,
    },
    {
      headerName: "Present",
      field: "isPresent",
      cellRenderer: CheckboxCellRenderer,
      editable: false,
      sortable: false,
      filter: false,
      width: 100,
    },
  ]);

  const {
    isLoading,
    isLoadingAttendance,
    getAllClassesAndSubjects,
    getStudentsAttendanceForDay,
    submitAttendance,
  } = useTeacherStore();

  const normalizeSubjects = (subjectIds) => {
    if (!subjectIds) return [];
    if (Array.isArray(subjectIds)) {
      return subjectIds.map((sub) => ({
        _id: sub._id,
        name: sub.name,
      }));
    }
    if (typeof subjectIds === "string") {
      return subjectIds.split(",").map((s) => s.trim());
    }
    return [];
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getAllClassesAndSubjects();
        if (data.classes.length === 0) {
          toast.error("No classes found");
          return;
        }

        let classList = [];

        if (Array.isArray(data)) {
          classList = data;
        } else if (data?.classes?.classes) {
          classList = data.classes.classes;
        }

        if (classList.length > 0) {
          setClasses(classList);
          setSelectedClassId(classList[0]._id || "");

          const subjects = normalizeSubjects(classList[0].subjectIds);
          setSelectedSubjectId(subjects[0]?._id || "");
        } else {
          toast.error("No classes found");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to load classes");
      }
    };

    fetchClasses();
  }, [getAllClassesAndSubjects]);

  const selectedClass = useMemo(
    () => classes.find((cls) => cls._id === selectedClassId),
    [classes, selectedClassId]
  );

  const availableSubjects = useMemo(() => {
    return normalizeSubjects(selectedClass?.subjectIds);
  }, [selectedClass]);

  const handleClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedClassId(newClassId);
    const newClass = classes.find((cls) => cls._id === newClassId);
    const subjects = normalizeSubjects(newClass?.subjectIds);
    setSelectedSubjectId(subjects[0]?._id || "");
  };

  const handleSubjectChange = (e) => setSelectedSubjectId(e.target.value);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!selectedClassId || !selectedSubjectId) {
      toast.error("Please select both Class and Subject.");
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      if (isLoadingAttendance) return;

      const data = await getStudentsAttendanceForDay(
        today,
        selectedClassId,
        selectedSubjectId
      );
      console.log(data);

      if (data?.success && data.attendanceList) {
        setRowData(
          data.attendanceList.map((item) => ({ ...item, id: item.studentId }))
        );
        toast.success("Attendance data retrieved successfully.");
      } else {
        toast.error(data?.message || "Failed to load attendance data.");
        setRowData([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load attendance");
    }
  };

  const handleSubmitAttendance = async () => {
    if (!gridRef.current) return;

    const currentData = [];
    gridRef.current.api.forEachNode((node) => currentData.push(node.data));

    if (currentData.length === 0) {
      toast.error("No attendance data to submit.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const attendanceData = currentData.map((row) => ({
      studentId: row.studentId,
      isPresent: row.isPresent,
    }));

    try {
      const result = await submitAttendance(
        today,
        selectedClassId,
        selectedSubjectId,
        attendanceData
      );
      if (result.success) {
        toast.success("Attendance submitted successfully.");
      } else {
        toast.error(result.message || "Failed to submit attendance.");
      }
    } catch (error) {
      toast.error("Error submitting attendance.");
    }
  };

  const handleSelectAll = (isPresent) => {
    if (!gridRef.current) return;
    const updatedData = rowData.map((row) => ({ ...row, isPresent }));
    setRowData(updatedData);
    gridRef.current.api.setRowData(updatedData);
  };

  return (
    <div className="p-4 sm:p-3">
      <TeacherHeader name="Attendance" />
      <div className="bg-white shadow-sm p-4 w-full mt-4 rounded-lg">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Select Class</h2>
              <select
                className={INPUT_STYLE}
                onChange={handleClassChange}
                value={selectedClassId}
              >
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h2 className="text-lg font-bold">Select Subject</h2>
              <select
                className={INPUT_STYLE}
                onChange={handleSubjectChange}
                value={selectedSubjectId}
              >
                {availableSubjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button
                type="submit"
                className="bg-[#6c62ff] text-white px-4 py-2 rounded-md shadow-md hover:bg-[#6c62ff] focus:outline-none"
              >
                {isLoadingAttendance ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  "Load Students"
                )}
              </button>
            </div>
          </div>
        </form>
        {rowData.length > 0 && (
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => handleSelectAll(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 focus:outline-none"
            >
              Select All Present
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 focus:outline-none"
            >
              Select All Absent
            </button>
            <button
              onClick={handleSubmitAttendance}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
            >
              {isLoadingAttendance ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                "Submit Attendance"
              )}
            </button>
          </div>
        )}
      </div>
      <div className="mt-6">
        <div className="ag-theme-alpine" style={{ height: 400 }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={colDefs}
            rowData={rowData}
            pagination
            getRowId={(params) => params.data.id}
            frameworkComponents={{ checkboxCellRenderer: CheckboxCellRenderer }}
            rowSelection="multiple"
          />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
