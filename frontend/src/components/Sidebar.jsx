import React from 'react';
import logo from "../assets/intango-logo.png";
import {
  GraduationCap,
  LayoutDashboard,
  ListCheck,
  LogOut,
  School,
  Users
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import clsx from 'clsx';
import { authStore } from "../store/authStore";
import { toast } from 'react-hot-toast';

const Sidebar = ({ isOpen }) => {
  const { user } = authStore();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem('token');
    authStore.setState({ isAuthorized: false, user: null, token: null });
    navigate('/signin');
    toast.success('logged out successfully');
  };

  const NavItem = ({ to, icon: Icon, label , ...rest}) => (
    <NavLink
      to={to}
      {...rest}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 p-3 rounded-md transition-colors duration-150',
          'hover:bg-[#f3f4ff] hover:text-[#6c62ff]',
          isActive && 'bg-[#eceeff] border-r-4 border-[#6c62ff] text-[#6c62ff] font-semibold',
          isOpen && 'justify-center' // center icon when collapsed
        )
      }
      title={isOpen ? label : undefined}   // tooltip for collapsed mode
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className={clsx('truncate', isOpen && 'hidden')}>{label}</span>
    </NavLink>
  );

  return (
    <aside
      className={clsx(
        'h-screen bg-white border-r flex flex-col transition-all duration-300',
        isOpen ? 'w-[50px]' : 'w-[250px]'
      )}
    >
    
      <div className="flex items-center justify-center py-3 border-b">
        <img src={logo} alt="logo" className="w-10" />
        <p className={clsx('ml-2 font-semibold resize-none', isOpen && 'hidden')}>
        INTANGO <span className="text-[#6c62ff]">TSS</span>
        <span className='font-thin ml-1  px-3 py-1 rounded-full border bg-white  transform hover:scale-105 transition-all duration-200'>
  { user?.role }
</span>
        </p>
      </div>

      <nav className="flex-1 mt-4 px-2 space-y-1">
        { user?.role.toLowerCase() === 'admin' && (
          <>
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/teachers" icon={Users} label="Teachers" />
        <NavItem to="/students" icon={GraduationCap} label="Students" />
        <NavItem to="/classes" icon={School} label="Classes" />
        <NavItem to="/attendance" icon={ListCheck} label="Attendance" />
          </>
        )}

        { user?.role.toLowerCase() === 'teacher' && (
          <>
        <NavItem to="/teacher" end icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/teacher/students" icon={School} label="Students" />
        <NavItem to="/teacher/classes" icon={School} label="Classes" />
        <NavItem to="/teacher/attendance" icon={ListCheck} label="Attendance" />
          </>
        )
        }
        { user?.role.toLowerCase() === 'student' && (
          <>
          <NavItem to="/student" end icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/student/attendance" icon={ListCheck} label="Attendance" />
          </>
        )}

      </nav>

      <div className={clsx('mt-auto mb-4 px-2', isOpen && 'hidden')}>
        <div className="border-t-2 pt-3">
          <button
            onClick={logoutHandler}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <p className="mt-2 text-center text-sm text-gray-600">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;