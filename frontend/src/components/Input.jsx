import React from 'react'
import clsx from 'clsx';

const Input = ({ type , name , setEmail , setPassword , isEmptyEmail  , isEmptyPassword,
}) => {
  return (
    <input onChange={(e) => {
        setEmail ? setEmail(e.target.value) : setPassword(e.target.value);
    }} type={type} placeholder={name}  className={clsx(
  'w-full p-3 my-2 outline-none bg-gray-50 border rounded focus:border-[#6c62ff] transition-all duration-100',
  isEmptyEmail && 'border-red-500',
  isEmptyPassword && 'border-red-500'
)}
></input>
  )
}

export default Input;