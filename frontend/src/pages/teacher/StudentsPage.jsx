import React, { useEffect, useState } from "react";
import TeacherHeader from "../../components/TeacherHeader";
import SearchInput from "../../components/SearchInput";
import Filter from "../../components/Filter";
import { useAppStore } from "../../store/adminStore.js";
import useTeacherStore from "../../store/teacherStore";
import { toast } from "react-hot-toast"

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader } from "lucide-react";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const StudentsPage = () => {

  const [classes, setClasses] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [classToDisplayStudents, setclassToDisplayStudents] = useState("");
  
  const [colDefs, setColDefs] = useState([
      {
        headerName: "ID",
        valueGetter: (params) => params.node.rowIndex + 1,
      },
      { field: "firstName", filter: true , flex: 1 },
      { field: "secondName", filter: true , flex: 1},
      { field: "email", filter: true , flex: 1 },  
    ]);

      const {
     
        getStudentsByClass,
        isLoading
      } = useAppStore();
    

const { getClasses , isLoadingClasses ,} = useTeacherStore()

  useEffect(() => {

    const fetchClasses = async () => {
      try {
        const data = await getClasses();
       if(data.classes.length === 0){
        toast.error("No classes found for the teacher");
       }
        setClasses(data.classes.classes);
        setclassToDisplayStudents(data.classes.classes[0]?._id || "")
      } catch (error) {
        console.log(error);
        toast.error(error.message)
      }
    };

    fetchClasses();
  },[getClasses  ,setclassToDisplayStudents]);
  useEffect(() => {
    const fetchStudentsByClass = async () => {
      try {
        const data = await getStudentsByClass(classToDisplayStudents);
        console.log(data)
        if (data.success) {
          if(data.students.length === 0){
            toast.error("No students found for the selected class");
          }
          setRowData(data.students);
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

  return (
    <>
    { isLoadingClasses ?<div className="w-full flex items-center justify-center h-full">      <Loader className="animate-spin text-[#6c62ff]" />
    </div>
 :  <>  
    <TeacherHeader name={'Students'} />
      <div className="w-full justify-between flex gap-5">
        <SearchInput setSearchInput={setSearchInput} />
        <Filter classes={classes} setclassToDisplayStudents={setclassToDisplayStudents} />
      </div>

     <div className="mt-2" style={{ height: 490 }}>
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
    </>}
    </>
  );
};

export default StudentsPage;
