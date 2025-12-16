import { Sidebar } from 'lucide-react';
import React from 'react'
import { authStore } from '../store/authStore';
import getNameFromEmail from '../utils/getName.js';
import { useState } from 'react';
import { useEffect } from 'react';


 
 const Navbar = ({ setIsOpen }) => {
  const { user } = authStore();

const [greeting, setGreeting] = useState("");

  const updateGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  };

  useEffect(() => {
    updateGreeting();

    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  const userEmial = user?.email.slice(0,1).toUpperCase();

  return (
    <div className='w-full border-b py-8 h-11 flex justify-between items-center'>
        <div  className='flex items-center gap-4'>
        <Sidebar onClick={() => setIsOpen(prev => !prev)}  className='ml-2 cursor-e-resize text-gray-500' />
        <p className="text-xl font-semibold">
  {greeting},{" "}
  {user.firstName && user.secondName
    ? `${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)} ${user.secondName.charAt(0).toUpperCase() + user.secondName.slice(1)}`
    : "Admin"}
</p>
        </div>
       <div className='flex items-center gap-4'>
       <div className={ `w-[40px] h-[40px] font-semibold text-xl text-white mr-3 rounded-full cursor-pointer flex items-center justify-center` }   style={{ backgroundColor: user.color || 'rgb(37, 99, 235)' }} >
{userEmial }</div>
       </div>
    </div>
  )
}

export default Navbar;