import React from 'react'
import { useNavigate } from 'react-router-dom';
import List from '../List';
const Religion = ({user}) => {
    const nav = useNavigate()
    const religions = [
      { name: "Christianity", abbreviation: "CHR" },
      { name: "Islam", abbreviation: "ISL" },
      { name: "Hinduism", abbreviation: "HIN" },
      { name: "Buddhism", abbreviation: "BUD" },
      { name: "Judaism", abbreviation: "JUD" },
      { name: "Sikhism", abbreviation: "SIK" },
      { name: "Bahá'í Faith", abbreviation: "BAH" },
      { name: "Jainism", abbreviation: "JAI" },
      { name: "Shinto", abbreviation: "SHI" },
      { name: "Zoroastrianism", abbreviation: "ZOR" },
      { name: "Taoism", abbreviation: "TAO" },
      { name: "Confucianism", abbreviation: "CON" }
    ];
    
  return (
    <div>
      <ul className='text-white  overflow-x-scroll m-3 flex gap-2 justify-center items-center bg-blue-500 bg-opacity-40'>
        {religions.map((group, index)=>(
            <li onClick={()=> nav(`/dashboard/${user}/groups/${group.name}/Religion`)} className='cursor-pointer p-2 hover:bg-white font-thin hover:bg-opacity-30' key={index} title={group.name}>{group.abbreviation}</li>
        ))}
      </ul>
      <div className="">
          <List category="Religion"/>
        </div>
    </div>
  )
}

export default Religion
