import { create } from "zustand";

import { authStore } from "../store/authStore.js";
import axios from "axios";

const TEACHER_BASE_URL = 'http://localhost:4000/api/teacher';


const useTeacherStore = create((Set) => ({
    isLoadingClasses: false,
    isLoading: false,
    isLoadingAttendance: false,
    
    getClasses: async () => {
        const { user } = authStore.getState();
        Set({ isLoadingClasses: true });
        try {
      const { data } =  await  axios.post(TEACHER_BASE_URL + '/classes', { id: user._id } );
      return data;
        } catch (error) {
     console.error("Error to get  classes: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get classes",
      };
    } finally {
      Set({ isLoadingClasses: false });
    }},

   getAllClassesAndSubjects: async () => {
    const { user } = authStore.getState();
    Set({ isLoading: true });
    try {
  const { data } =  await  axios.post(TEACHER_BASE_URL + '/getAllClassesAndSubjects', { id: user._id } );
  return data;
    } catch (error) {
 console.error("Error to get  classes: ", error);
  return {
    success: false,
    message: error.response?.data?.message || "Failed to get classes",
  };
} finally {
  Set({ isLoading: false });
}},
   getAllStudentsAndAttendance: async ( month , year , selectedClassId , selectedSubjectId ) => {
    const { user } = authStore.getState();
    Set({ isLoadingAttendance: true });
    try {
  const { data } =  await  axios.post(TEACHER_BASE_URL + '/getAttendance', { takenByTeacherId: user._id ,  month , year , classId: selectedClassId , subjectId: selectedSubjectId} );
  return data;
    } catch (error) {
 console.error("Error to get  attendance: ", error);
  return {
    success: false,
    message: error.response?.data?.message || "Failed to get attendance",
  };
} finally {
  Set({ isLoadingAttendance: false });
}},
   updateRecord: async ( payload ) => {
    Set({ isLoadingAttendance: true });
    try {
  const { data } =  await  axios.post(TEACHER_BASE_URL + '/updateDailyAttendance', { payload });

  return data;
    } catch (error) {
 console.error("Error to get  change attendance: ", error);
  return {
    success: false,
    message: error.response?.data?.message || "Failed to change attendance",
  };
} finally {
  Set({ isLoadingAttendance: false });
}},

   getTeacherOverview: async () => {
    const { user } = authStore.getState();
    Set({ isLoading: true });
    try {
  const { data } =  await  axios.post(TEACHER_BASE_URL + '/getTeacherCount', { id: user._id } );
  return data;
    } catch (error) {
 console.error("Error to get  teacher overview: ", error);
  return {
    success: false,
    message: error.response?.data?.message || "Failed to get teacher overview",
  };
} finally {
  Set({ isLoading: false });
}},


}));

export default useTeacherStore;