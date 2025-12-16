import axios from "axios";
import { create } from "zustand";

const ADMIN_BASE_URL = "http://localhost:4000/api/admin";

export const useAppStore = create((Set) => ({
  isLoading: false,
  isLoadingAttendance: false,

  addClass: async ({ name, subjectIds }) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.post(ADMIN_BASE_URL + "/add-class", {
        name,
        subjectIds,
      });
      return data;
    } catch (error) {
      console.error("Error to add a class: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add class",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  getClasses: async () => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.get(ADMIN_BASE_URL + "/classes");
      return data;
    } catch (error) {
      console.error("Error to get all classes: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get classes",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  addStudent: async ({ email, password, firstName, secondName, classId }) => {
    Set({ isLoading: true });

    try {
      const { data } = await axios.post(ADMIN_BASE_URL + "/add-student", {
        email,
        password,
        firstName,
        secondName,
        classId,
      });
      return data;
    } catch (error) {
      console.error("Error to add a student: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add student",
      };
    } finally {
      Set({ isLoading: false });
    }
  },
  addTeacher: async ({
    email,
    firstName,
    secondName,
    password,
    classes,
    subjectIds,
  }) => {
    Set({ isLoading: true });

    try {
      const { data } = await axios.post(ADMIN_BASE_URL + "/add-teacher", {
        email,
        password,
        firstName,
        secondName,
        classes,
        subjectIds,
      });
      return data;
    } catch (error) {
      console.error("Error to add a teacher: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add teacher",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  getAllClasses: async () => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.get(ADMIN_BASE_URL + "/classesById");
      return data;
    } catch (error) {
      console.error("Error toget all class: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get classes",
      };
    } finally {
      Set({ isLoading: false });
    }
  },
  getAllTeachers: async () => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.get(ADMIN_BASE_URL + "/teachers");
      return data;
    } catch (error) {
      console.error("Error to get all teachers: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get teachers",
      };
    } finally {
      Set({ isLoading: false });
    }
  },
  getStudentsByClass: async (id) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.post(
        ADMIN_BASE_URL + "/getStudentsByClass",
        { id }
      );
      return data;
    } catch (error) {
      console.error("Error to get all class: ", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get classes",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  updateStudent: async (payload) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.post(
        ADMIN_BASE_URL + "/updateStudent",
        payload
      );
      return data;
    } catch (error) {
      console.error("Error updating student", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update student",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  deleteStudent: async (id) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.delete(ADMIN_BASE_URL + "/student/" + id);
      return data;
    } catch (error) {
      console.error("Error deleting student", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete student",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  getClassesAndSubjects: async () => {
    Set({ isLoading: true });

    try {
      const { data } = await axios.get(
        ADMIN_BASE_URL + "/getClassesAndSubjects"
      );
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error to get all classes and subjects: ", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to get classes and subjects",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  deleteTeacher: async (email) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.delete(ADMIN_BASE_URL + "/teacher", {
        data: { email },
      });
      return data;
    } catch (error) {
      console.error("Error deleting teacher", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete teacher",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  updateTeacher: async (payload) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.post(
        ADMIN_BASE_URL + "/updateTeacher",
        payload
      );
      return data;
    } catch (error) {
      console.error("Error updating teacher", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update teacher",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  deleteClass: async (id) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.delete(ADMIN_BASE_URL + "/class/" + id);
      return data;
    } catch (error) {
      console.error("Error deleting class", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete class",
      };
    } finally {
      Set({ isLoading: false });
    }
  },

  updateClass: async (payload) => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.post(
        ADMIN_BASE_URL + "/updateClass",
        payload
      );
      return data;
    } catch (error) {
      console.error("Error updating class", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update class",
      };
    } finally {
      Set({ isLoading: false });
    }
  },
  getMonthlyAttendance: async (year) => {
    Set({ isLoadingAttendance: true });
    try {
      const { data } = await axios.post(
        ADMIN_BASE_URL + "/getMonthlyAttendance",
        { year }
      );
      return data;
    } catch (error) {
      console.error("Error getting monthly attendance", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get monthly attendance",
      };
    } finally {
      Set({ isLoadingAttendance: false });
    }
  },
  getCounts: async () => {
    Set({ isLoading: true });
    try {
      const { data } = await axios.get(  ADMIN_BASE_URL + "/counts");
      return data;
    } catch (error) {
      console.error("Error getting count", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get count",
      };
    } finally {
      Set({ isLoading: false });
    }
  },
}));
