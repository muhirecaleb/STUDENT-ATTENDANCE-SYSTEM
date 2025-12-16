import React from 'react'

const TeacherHeader = ({ name }) => {
  return (
    <header className='ml-4'>
        <h2 className='text-3xl font-semibold'>{name}</h2>
        <p className='text-gray-600 mt-2'>View search, and manage all your {name.toLowerCase()} here.</p>
    </header>
  )
}

export default TeacherHeader;