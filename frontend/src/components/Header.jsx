import { Plus } from 'lucide-react';
import React from 'react';

const Header = ({ setState , name}) => (
    <div className="flex w-full justify-between items-center border-2 p-3 rounded-lg">
        <h3 className="font-semibold text-2xl">{ name }</h3>
        <button
            onClick={() => setState((prev) => !prev)} 
            className="bg-[#6c62ff] px-5 py-3 rounded-lg text-white flex items-center gap-2"
        >
          <Plus />  Add {name}
        </button>
    </div>
);

export default Header;