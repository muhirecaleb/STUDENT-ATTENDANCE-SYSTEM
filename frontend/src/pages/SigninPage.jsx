import React, { useEffect, useState } from "react";
import logo from "../assets/intango-logo.png";
import Input from "../components/Input";
import { authStore } from "../store/authStore";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import clsx from "clsx";

const SigninPage = () => {
  const [state, setState] = useState("");
  const [isEmptyEmail, setIsEmptyEmail] = useState(false);
  const [isEmptyPassword, setIsEmptyPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin, isLoading, error, login , user } = authStore();

  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      if (email === "") {
        setIsEmptyEmail(true);
      }
      if (password === "") {
        setIsEmptyPassword(true);
      }
      return;
    }

    try {
      if (state === "Admin") {
        const data = await adminLogin(email, password);
        if (data) {
          toast.success("Logged in successfully");
          navigate("/");
        }
      } else {
const data = await login(email, password);
        if (data) {
          toast.success("Logged in successfully");
         if(data.user.role === 'teacher'){
          navigate("/teacher");
         } else if(data.user.role === 'student'){
          navigate("/student");
        } 
      }
        }
    } catch (error) {
      console.log("error to login", error);
    }
  };

  useEffect(() => {
    setIsEmptyEmail(false);
  }, [email]);

  useEffect(() => {
    setIsEmptyPassword(false);
  }, [password]);

  return (
    <div className="bg-[#f3f2f8] min-h-screen w-full">
      <div className="flex justify-center items-center h-screen flex-col px-5">
        <div className="flex flex-col justify-center items-center">
          <img className="w-[100px]" src={logo} alt="image logo" />
          <h2 className="font-semibold text-2xl py-4">
            Sign In into your account
          </h2>
        </div>
        <div className="bg-white shadow-xl w-[400px]  flex flex-col items-center rounded">
          <form onSubmit={loginHandler} className="w-full p-5 flex flex-col">
            <label className="text-lg" htmlFor="email">
              Email
            </label>
            <Input
              type={"email"}
              name="Enter  your email"
              setEmail={setEmail}
              isEmptyEmail={isEmptyEmail}
              setIsEmptyEmail={setIsEmptyEmail}
              id="email"
            />
            <label className="text-lg" htmlFor="password">
              Password
            </label>
            <Input
              type={"password"}
              name="Enter  your password"
              setPassword={setPassword}
              isEmptyPassword={isEmptyPassword}
              setIsEmptyPassword={setIsEmptyPassword}
              id="password"
            />

            {error && (
              <div className="w-full bg-red-100 border-2 border-red-200 p-4 rounded">
                <p className="text-red-500">{error.message}</p>
              </div>
            )}

            <button
              disabled={isLoading} 
              type="submit"
              className={clsx("mt-6 w-full p-3 rounded font-semibold text-white bg-[#6c62ff] cursor-pointer flex justify-center", isLoading && 'opacity-65 hover:cursor-not-allowed')}
            >
              {isLoading ? (
                <Loader className="animate-spin text-center" />
              ) : (
                "Login"
              )}
            </button>
            <p className="mt-5">
              Sign In as?{" "}
              <span
                onClick={() => setState(prev => prev === "Admin" ? "" : "Admin")}
                className={clsx(
                  "text-[#6c62ff] cursor-pointer",
                  state === "Admin" && "underline"
                )}
              >
                Admin
              </span>{" "}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
