import React, { useState, useEffect, useMemo } from "react";
import TeacherHeader from "../../components/TeacherHeader";
import DatePicker from "react-datepicker";
import useTeacherStore from "../../store/teacherStore.js";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader } from "lucide-react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const CheckboxCellRenderer = React.memo((props) => {
 const { updateRecord } = useTeacherStore();

 const { value, data, colDef } = props;
 const dayIndex = colDef.dayIndex;
 const attendanceId = data.attendanceId;

 const [isChecked, setIsChecked] = useState(value);

 useEffect(() => {
  setIsChecked(value);
 }, [value]);

 const handleChange = async () => {
  const newCheckedState = !isChecked;
  setIsChecked(newCheckedState);
  const payload = {
   attendanceId: attendanceId,
   dayIndex: dayIndex,
   isPresent: newCheckedState,
  };

  try {
   const result = await updateRecord(payload);

   if (result.success) {
    toast.success(`Attendance for Day ${dayIndex + 1} set to: ${newCheckedState ? 'Present' : 'Absent'}`);

    // Update the attendance data in the grid
    const newDailyAttendance = [...props.data.dailyAttendance];
    newDailyAttendance[dayIndex] = newCheckedState;

    props.api.applyTransaction({
     update: [{ ...props.data, dailyAttendance: newDailyAttendance }]
    });
   } else {
    setIsChecked(props.value); // Revert to initial value if update fails
    toast.error('Failed to update attendance on the server.');
   }
  } catch (error) {
   setIsChecked(props.value); // Revert to initial value if network error
   toast.error('Network error during attendance update.');
  }
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
 const [startDate, setStartDate] = useState(new Date());
 const [colDefs, setColDefs] = useState([
  { headerName: "#", valueGetter: (params) => params.node.rowIndex + 1, width: 60 },
  { field: "firstName", headerName: "First Name", filter: true },
  { field: "secondName", headerName: "Second Name", filter: true },
 ]);

 const { isLoading, isLoadingAttendance, getAllClassesAndSubjects, getAllStudentsAndAttendance, updateRecord } = useTeacherStore();

 const normalizeSubjects = (subjectIds) => {
  if (!subjectIds) return [];
  if (Array.isArray(subjectIds)) {
   return subjectIds.map((sub) => ({
    _id: sub._id,
    name: sub.name
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
    if(data.classes.length === 0){
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

 const handleDateChange = (date) => setStartDate(date);

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

  const year = startDate.getFullYear();
  const month = (startDate.getMonth() + 1).toString().padStart(2, "0");


  try {

   if(isLoadingAttendance) return;

   const data = await getAllStudentsAndAttendance(month, year, selectedClassId, selectedSubjectId);
   console.log(data);

   if (data?.success && data.attendanceList) {
    const flattenedData = data.attendanceList.flat().map(item => ({
     id: item.studentId._id,
     firstName: item.studentId.firstName,
     secondName: item.studentId.secondName,
     dailyAttendance: item.dialyAttendance,
     attendanceId: item._id,
    }));

    setRowData(flattenedData);

    if (flattenedData.length > 0) {
     const daysInMonth = flattenedData[0].dailyAttendance.length;

     const initialCols = [
      { headerName: "#", valueGetter: (params) => params.node.rowIndex + 1, width: 60, sortable: false, filter: false, pinned: 'left' },
      { field: "firstName", headerName: "First Name", filter: true, width: 120, pinned: 'left' },
      { field: "secondName", headerName: "Second Name", filter: true, width: 120, pinned: 'left' },
     ];

     const dayColumns = Array.from({ length: daysInMonth }, (_, dayIndex) => ({
      headerName: `${dayIndex + 1}`,
      field: `day_${dayIndex + 1}`,
      valueGetter: (params) => params.data.dailyAttendance[dayIndex],
      cellRenderer: CheckboxCellRenderer,
      editable: false,
      sortable: false,
      filter: false,
      width: 50,
      dayIndex: dayIndex,
     }));

     setColDefs([...initialCols, ...dayColumns]);
    } else {
     setColDefs([
      { headerName: "#", valueGetter: (params) => params.node.rowIndex + 1, width: 60 },
      { field: "firstName", headerName: "First Name", filter: true },
      { field: "secondName", headerName: "Second Name", filter: true },
     ]);
    }

    toast.success('Attendance data retrieved and table updated.');
   } else {
    toast.error(data?.message || "Failed to load attendance data.");
    setRowData([]);
    setColDefs([
     { headerName: "#", valueGetter: (params) => params.node.rowIndex + 1, width: 60 },
     { field: "firstName", headerName: "First Name", filter: true },
     { field: "secondName", headerName: "Second Name", filter: true },
    ]);
   }
  } catch (error) {
   console.error(error);
   toast.error(error.message || "Failed to load attendance");
  }
 };

 const generateReport = () => {
  if (rowData.length === 0) {
   toast.error("No attendance data selected to generate a report. Please click 'Search' first.");
   return;
  }

  const classInfo = selectedClass ? selectedClass.name : 'UnknownClass';
  const subjectInfo = availableSubjects.find(sub => sub._id === selectedSubjectId)?.name || 'UnknownSubject';
  const monthYear = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  // Prepare CSV content
  const header = ["First Name", "Second Name", ...colDefs.filter(c => c.dayIndex !== undefined).map(c => `Day ${c.dayIndex + 1}`), "Total Present", "Total Absent"];
  const csvRows = [header.join(',')];

  rowData.forEach(row => {
   const dailyAttendanceStatus = row.dailyAttendance.map(isPresent => isPresent ? 'P' : 'A');
   const totalPresent = row.dailyAttendance.filter(Boolean).length;
   const totalAbsent = row.dailyAttendance.length - totalPresent;

   const rowArray = [
    row.firstName,
    row.secondName,
    ...dailyAttendanceStatus,
    totalPresent,
    totalAbsent
   ];
   csvRows.push(rowArray.join(','));
  });

  const csvString = csvRows.join('\n');
  
  // Create a Blob and a link to download the CSV
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Attendance_Report_${classInfo}_${subjectInfo}_${monthYear}.csv`;
  link.click();
  
  toast.success(`Report for ${classInfo} (${subjectInfo}) downloaded successfully!`);
 };


 return (
  <div className="p-4 sm:p-3">
   <TeacherHeader name="Attendance" />
   <div className="bg-white shadow-sm p-4 w-full mt-4 rounded-lg">
    <form onSubmit={handleSearch}>
     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
       <h2 className="text-lg font-bold">Select Class & Subject</h2>
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
      <div>
       <h2 className="text-lg font-bold">Select Date</h2>
      <DatePicker
 selected={startDate}
 onChange={handleDateChange}
 dateFormat="yyyy/MM"
 showMonthYearPicker 
 className={INPUT_STYLE}
/>
      </div>
      <div className="flex gap-4 mt-4 md:mt-0"> 
       <button
        type="submit"
        className="bg-[#6c62ff] text-white px-4 py-2 rounded-md shadow-md hover:bg-[#6c62ff] focus:outline-none"
       >
        {isLoadingAttendance ? <Loader className="animate-spin h-5 w-5" /> : 'Search'}
       </button>
       <button
        type="button"
        onClick={generateReport}
        disabled={rowData.length === 0 || isLoadingAttendance}
        className={`px-4 py-2 rounded-md shadow-md focus:outline-none transition duration-150 
         ${rowData.length > 0 && !isLoadingAttendance 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
         }`}
       >
        Generate Report
       </button>
      </div>
     </div>
    </form>
   </div>
   <div className="mt-6">
    <div className="ag-theme-alpine" style={{ height: 400 }}>
     <AgGridReact
      columnDefs={colDefs}
      rowData={rowData}
      pagination
      frameworkComponents={{ checkboxCellRenderer: CheckboxCellRenderer }}
      rowSelection="multiple"
     />
    </div>
   </div>
  </div>
 );
};

export default AttendancePage;