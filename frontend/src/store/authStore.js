import { create } from "zustand";
import axios from "axios";
import { data } from "react-router";

const ADMIN_BASE_URL = "http://localhost:4000/api/admin";
const AUTH_BASE_URL = "http://localhost:4000/api/auth";

axios.defaults.withCredentials = true;

export const authStore = create((Set, get) => ({
  isLoading: false,
  error: null,
  isAuthorized: false,
  isCheckingAuth: false,
  token: localStorage.getItem("token") || null,
  user: null,

  adminLogin: async (email, password) => {
    Set({ isLoading: true, error: false });

    try {
      const { data } = await axios.post(ADMIN_BASE_URL + "/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      Set({ user: data.user, isAuthorized: true });

      return data;
    } catch (error) {
      console.log("error to login", error.response.data);
      Set({ error: error.response.data });
    } finally {
      Set({ isLoading: false });
    }
  },
  login: async (email, password) => {
    Set({ isLoading: true, error: false });

    try {
      const { data } = await axios.post(AUTH_BASE_URL + "/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);

      console.log(data);
      Set({ user: data.user, isAuthorized: true });
      return data;
    } catch (error) {
      console.log("error to login", error.response.data);
      Set({ error: error.response.data });
    } finally {
      Set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    Set({ isCheckingAuth: true });
    try {
      const token = get().token;

      const { data } = await axios.post(
        AUTH_BASE_URL + "/checkAuth",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(data);

      console.log(data.user.role);
      Set({ user: data.user.userInfo || data.user, isAuthorized: true });
    } catch (error) {
      console.log("error to check auth", error.response.data);
    } finally {
      Set({ isCheckingAuth: false });
    }
  },
}));
