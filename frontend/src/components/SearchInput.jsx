import { Search } from 'lucide-react';
import React from 'react'

const SearchInput = ({ setSearchInput }) => {
  return (
    <div className='flex gap-2 items-center mt-2 flex-1'>
        <Search />
        <input 
        className="py-2 px-8 outline-none border rounded focus:border-gray-400 w-full"
        type="text"
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder='Search...'
        />
    </div>
  )
}

export default SearchInput;