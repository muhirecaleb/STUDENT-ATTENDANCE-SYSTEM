import React from 'react'

const Filter = ({ classes , setclassToDisplayStudents , classToDisplayStudents}) => {
  return (
<div className="flex items-center">
          <p className="text-nowrap mr-3 text-gray-700">Filter by class</p>
          <select
            name="class"
            id="class"
            value={classToDisplayStudents}
             onChange={(e) => setclassToDisplayStudents(e.target.value)}
            className="mt-1 w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-indigo-50"
          >
           {  
            classes.map((item , index) => {
              return <option key={index} value={item._id}>{item.name}</option>
            })
           }
          </select>
        </div>
      )
}

export default Filter;