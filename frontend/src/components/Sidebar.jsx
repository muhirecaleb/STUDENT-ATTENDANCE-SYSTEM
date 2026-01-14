import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  School,
  Users,
  Menu,
  X,
  Calendar,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import clsx from "clsx";
import { authStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import logo from "../assets/intango-logo.png";

const Sidebar = ({ isOpen }) => {
  const { user } = authStore();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    authStore.setState({ isAuthorized: false, user: null, token: null });
    navigate("/signin");
    toast.success("logged out successfully");
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const NavItem = ({ to, icon: Icon, label, ...rest }) => (
    <NavLink
      to={to}
      {...rest}
      onClick={closeMobileMenu}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 p-3 rounded-md transition-colors duration-150",
          "hover:bg-[#f3f4ff] hover:text-[#6c62ff]",
          isActive &&
            "bg-[#eceeff] border-r-4 border-[#6c62ff] text-[#6c62ff] font-semibold",
          !isMobile && isOpen && "justify-center"
        )
      }
      title={!isMobile && isOpen ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className={clsx("truncate", !isMobile && isOpen && "hidden")}>
        {label}
      </span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "h-screen bg-white border-r flex flex-col transition-all duration-300",
          // Desktop behavior
          !isMobile && (isOpen ? "w-[50px]" : "w-[250px]"),
          // Mobile behavior
          isMobile && "fixed left-0 top-0 w-[250px] z-40",
          isMobile && !isMobileOpen && "-translate-x-full",
          isMobile && isMobileOpen && "translate-x-0 shadow-2xl"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center py-[12px] border-b">
          <img src={logo} alt="logo" className="w-10" />
          <div
            className={clsx(
              "ml-2 flex items-center gap-2",
              !isMobile && isOpen && "hidden"
            )}
          >
            <p className="font-semibold">
              INTANGO <span className="text-[#6c62ff]">TSS</span>
            </p>
            <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full border bg-white transform hover:scale-105 transition-all duration-200">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto">
          {user?.role.toLowerCase() === "admin" && (
            <>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/teachers" icon={Users} label="Teachers" />
              <NavItem to="/students" icon={GraduationCap} label="Students" />
              <NavItem to="/classes" icon={School} label="Classes" />
              <NavItem to="/timetable" icon={Calendar} label="Timetable" />
            </>
          )}

          {user?.role.toLowerCase() === "teacher" && (
            <>
              <NavItem
                to="/teacher"
                end
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavItem to="/teacher/students" icon={School} label="Students" />
              <NavItem to="/teacher/classes" icon={School} label="Classes" />
              <NavItem
                to="/teacher/attendance"
                icon={ListChecks}
                label="Attendance"
              />
              <NavItem to="/timetable" icon={Calendar} label="Timetable" />
            </>
          )}

          {user?.role.toLowerCase() === "student" && (
            <>
              <NavItem
                to="/student"
                end
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavItem
                to="/student/attendance"
                icon={ListChecks}
                label="Attendance"
              />
              <NavItem to="/timetable" icon={Calendar} label="Timetable" />
            </>
          )}
        </nav>

        {/* Logout Section */}
        <div
          className={clsx("mt-auto mb-4 px-2", !isMobile && isOpen && "hidden")}
        >
          <div className="border-t-2 pt-3">
            <button
              onClick={logoutHandler}
              className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
            <p className="mt-2 text-center text-sm text-gray-600 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
