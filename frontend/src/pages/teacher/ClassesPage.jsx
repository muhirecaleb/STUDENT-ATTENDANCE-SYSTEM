import React, { useEffect, useState } from 'react'
import TeacherHeader from '../../components/TeacherHeader';
import SearchInput from '../../components/SearchInput';
import useTeacherStore from '../../store/teacherStore.js';
import toast from 'react-hot-toast';

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader } from 'lucide-react';
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);


const ClassesPage = () => {

    const [searchInput, setSearchInput] = useState("");
    const { isLoading , getAllClassesAndSubjects } = useTeacherStore();
    const [rowData, setRowData] = useState([]);
    
    const [colDefs, setColDefs] = useState([
          {
            headerName: "ID",
            valueGetter: (params) => params.node.rowIndex + 1,
          },
          { field: "name", filter: true , flex: 1 },
          { field: "subjectIds", filter: true , flex: 1},
        ]);

  
        useEffect(() => {
          const fetchClasses = async () => {
            try {
              const data = await getAllClassesAndSubjects();        
              if (data?.classes?.classes) {
                const formatted = data.classes.classes.map(cls => ({
                  ...cls,
                  subjectIds: cls.subjectIds.map(sub => sub.name).join(", "),
                }));
                setRowData(formatted);
              }
            } catch (error) {
              console.error(error);
              toast.error(error.message);
            }
          };
        
          fetchClasses();
        }, [getAllClassesAndSubjects]);
        

  return (
    <div>
 <TeacherHeader name={'Classes'} />
 <div className="w-[80%] justify-between flex gap-5">
        <SearchInput setSearchInput={setSearchInput} />
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
    </div>
  )
};

export default ClassesPage;