import { create } from "zustand";
import axios from "axios";

export const useStudentStore = create((set) => ({
  isLoading: false,
  isLoadingSubjects: false,
  isLoadingOverview: false,

  getAttendace: async (studentId, month, year, subjectId) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/student/fetch-attendance",
        { studentId, month, year, subjectId }
      );

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

  getSubjects: async (studentId) => {
    set({ isLoadingSubjects: true });
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/student/fetch-subjects",
        { studentId }
      );
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

  getOverview: async (studentId) => {
    set({ isLoadingOverview: true });
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/student/get-overview",
        { studentId }
      );
      return data;
    } catch (error) {
      console.error("Error to get student overview: ", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to get student overview",
      };
    } finally {
      set({ isLoadingOverview: false });
    }
  },

  getMonthlyAttendance: async (studentId, year) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/student/get-monthly-attendance",
        { studentId, year }
      );
      return data;
    } catch (error) {
      console.error("Error getting student monthly attendance", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to get monthly attendance",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  getAttendanceYears: async (studentId) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/student/get-attendance-years",
        { studentId }
      );
      return data;
    } catch (error) {
      console.error("Error getting student attendance years", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to get attendance years",
      };
    } finally {
      set({ isLoading: false });
    }
  },
}));
