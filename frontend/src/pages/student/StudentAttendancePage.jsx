import React from "react";
import { useStudentStore } from "../../store/studentStore.js";
import { authStore } from "../../store/authStore.js";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader } from "lucide-react";
import TeacherHeader from "../../components/TeacherHeader.jsx";
import DatePicker from "react-datepicker";
import { useEffect } from "react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const StudentAttendancePage = () => {
  const {
    getAttendace,
    isLoading,
    getSubjects,
    isLoadingSubjects,
    getAttendanceYears,
  } = useStudentStore();
  const { user } = authStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [availableYears, setAvailableYears] = useState([]);
  const [message, setMessage] = useState("");

  const [colDefs, setColDefs] = useState([
    {
      headerName: "Date",
      field: "date",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      flex: 1,
    },
  ]);

  const [rowData, setRowData] = useState([]);

  const INPUT_STYLE =
    "p-2 bg-gray-100 text-gray-700 rounded-md border-2 border-[#6c62ff] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto transition duration-150";

  const handleSubjectChange = (e) => setSelectedSubjectId(e.target.value);
  const handleDateChange = (date) => setStartDate(date);

  const handleFetchAttendance = async (e) => {
    e.preventDefault();

    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();

    const response = await getAttendace(
      user._id,
      month,
      year,
      selectedSubjectId
    );
    if (response.success) {
      setMessage(""); // clear message
      if (response.attendance.length === 0) {
        setRowData([]);
        setColDefs([
          {
            headerName: "Date",
            field: "date",
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            headerName: "Status",
            field: "status",
            sortable: true,
            filter: true,
            flex: 1,
          },
        ]);
        setMessage(
          "There was no attendance made in the selected month for the chosen subject."
        );
        return;
      }

      const daysInMonth = response.attendance.length;

      const initialCols = [
        {
          headerName: "#",
          valueGetter: (params) => params.node.rowIndex + 1,
          width: 70,
          sortable: false,
          filter: false,
          pinned: "left",
        },
        {
          field: "date",
          headerName: "Date",
          filter: true,
          width: 150,
          pinned: "left",
        },
      ];

      const dayColumns = Array.from({ length: daysInMonth }, (_, dayIndex) => {
        const date = new Date(year, month - 1, dayIndex + 1);
        const dayName = date
          .toLocaleDateString("en-US", { weekday: "short" })
          .toLowerCase();
        return {
          headerName: `${dayName}, ${dayIndex + 1}`,
          field: `day_${dayIndex + 1}`,
          editable: false,
          sortable: false,
          filter: false,
          width: 80,
          dayIndex: dayIndex,
          // return a React element so React can render it properly
          cellRendererFramework: (params) => (
            <input
              type="checkbox"
              disabled
              checked={!!params.value}
              aria-label={`day-${dayIndex + 1}`}
            />
          ),
        };
      });

      setColDefs([...initialCols, ...dayColumns]);
      const rowObj = { date: `${month}/${year}`, month };
      response.attendance.forEach((val, idx) => {
        rowObj[`day_${idx + 1}`] = val;
      });

      setRowData([rowObj]);
      setMessage("Attendance fetched successfully");
    } else {
      setMessage(response.message || "Failed to fetch attendance");
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await getSubjects(user._id);
      if (response.success) {
        console.log(response);
        setSubjects(response.subjects);
        if (response.subjects.length > 0) {
          setSelectedSubjectId(response.subjects[0]._id);
        }
      }
    };

    const fetchYears = async () => {
      const response = await getAttendanceYears(user._id);
      if (response.success) {
        setAvailableYears(response.years);
        if (response.years.length > 0) {
          setStartDate(new Date(response.years[0], 0)); // set to first available year, Jan
        }
      }
    };

    fetchSubjects();
    fetchYears();
  }, [getSubjects, getAttendanceYears, user._id]);

  return (
    <div>
      <TeacherHeader name="Attendance" />

      {isLoadingSubjects ? (
        <div className="w-full h-[400px] flex items-center justify-center">
          <Loader className="animate-spin text-[#6c62ff]" />
        </div>
      ) : (
        <div>
          <form onSubmit={handleFetchAttendance}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3 bg-white p-4 rounded-md shadow-sm">
              <div>
                <h2 className="text-lg font-semibold">Select Subject</h2>
                <select
                  className={INPUT_STYLE}
                  onChange={handleSubjectChange}
                  value={selectedSubjectId}
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Select Date & Year</h2>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy/MM"
                  showMonthYearPicker
                  minDate={
                    availableYears.length > 0
                      ? new Date(
                          availableYears[availableYears.length - 1],
                          0,
                          1
                        )
                      : undefined
                  }
                  maxDate={
                    availableYears.length > 0
                      ? new Date(availableYears[0], 11, 31)
                      : undefined
                  }
                  className={INPUT_STYLE}
                />
              </div>

              <button
                type="submit"
                className="bg-[#6c62ff] text-white px-4 py-2 rounded-md shadow-md hover:bg-[#6c62ff] focus:outline-none mt-4 md:mt-0"
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            {message && (
              <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-md text-blue-800">
                {message}
              </div>
            )}
            <div className="ag-theme-alpine" style={{ height: 400 }}>
              <AgGridReact
                columnDefs={colDefs}
                rowData={rowData}
                pagination
                rowSelection="multiple"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
