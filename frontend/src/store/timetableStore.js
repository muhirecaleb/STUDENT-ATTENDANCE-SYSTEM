import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/timetable";

const useTimetableStore = create((set, get) => ({
  timetables: [],
  isLoading: false,
  token: localStorage.getItem("token") || null,

  uploadTimetable: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Error uploading timetable:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload timetable",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  getTimetables: async (classId = null) => {
    set({ isLoading: true });
    try {
      const params = classId ? { classId } : {};
      const { data } = await axios.get(API_BASE_URL, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        set({ timetables: data.timetables });
      }

      return data;
    } catch (error) {
      console.error("Error fetching timetables:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch timetables",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  getMyTimetables: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axios.get(`${API_BASE_URL}/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        set({ timetables: data.timetables });
      }

      return data;
    } catch (error) {
      console.error("Error fetching my timetables:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch timetables",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  getTimetableById: async (id) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return data;
    } catch (error) {
      console.error("Error fetching timetable:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch timetable",
      };
    }
  },

  deleteTimetable: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return data;
    } catch (error) {
      console.error("Error deleting timetable:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete timetable",
      };
    } finally {
      set({ isLoading: false });
    }
  },
}));

export { useTimetableStore };
