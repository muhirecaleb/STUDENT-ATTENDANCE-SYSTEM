import React from 'react'
import { Edit, Trash } from 'lucide-react';

const Button = () => {
  return (
    <div className="flex items-center gap-3 justify-center"><Trash  className="text-red-500 cursor-pointer mt-2"  /> <Edit className="text-[#6c62ff] cursor-pointer mt-2" /></div>
  )
}

export default Button;