import { create  } from "zustand";
import axios from "axios";

export const useStudentStore = create((set) => ({
    isLoading: false,  
    isLoadingSubjects: false,  

    getAttendace: async ( studentId , month , year , subjectId ) => {
        set({ isLoading: true });
        try {
        const { data } =  await  axios.post('http://localhost:4000/api/student/fetch-attendance', { studentId , month , year , subjectId } );
    
        return data;
        } catch (error) {
     console.error("Error to get  attendance: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get attendance",
      };
    } finally {
      set({ isLoading: false });
    }
},

getSubjects: async ( studentId ) => {
    set({ isLoadingSubjects: true });
    try {
    const { data } =  await  axios.post('http://localhost:4000/api/student/fetch-subjects', { studentId } );
    set({ subjects: data.subjects || [] });
    return data;
    } catch (error) {
 console.error("Error to get  subjects: ", error);
  return {
    success: false,
    message: error.response?.data?.message || "Failed to get subjects",
  };
} finally {
    set({ isLoadingSubjects: false });
}
},

}));    