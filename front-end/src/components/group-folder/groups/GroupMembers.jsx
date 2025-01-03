import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { FaUser } from 'react-icons/fa'

const GroupMembers = ({groupData, groupid, getData}) => {
  const nav = useNavigate()
  const [token, setToken] = useState(undefined)
  
  async function denyRequest(username){
    const getToken = localStorage.getItem('token');
    try {
      const response = await axios.post(`/api/deny-participant`, {
        groupid: groupid,
        username: username
      }, {
        headers: {
        'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
        'Content-Type': 'application/json'
      }})

      if(response.data.Success){
        alert(response.data.Message)
        getData()
      } else{
        alert(response.data.Message)
      }
    } catch (error) {
      console.error(`Axios Error ---> ${error}`)
    }
  }
  async function acceptRequest(username){
    const getToken = localStorage.getItem('token');
    try {
      const response = await axios.post(`/api/accept-participant`, {
        groupid: groupid,
        username: username
      }, {
        headers: {
        'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
        'Content-Type': 'application/json'
      }})

      if(response.data.Success){
        alert(response.data.Message)
        getData()
      } else{
        alert(response.data.Message)
      }
    } catch (error) {
      console.error(`Axios Error ---> ${error}`)
    }
  }

  return (
    <div className='flex justify-between'>
      <div className="">
        <h1 className='font-thin text-white text-2xl'>Members</h1>
      {groupData.participants.map((person, index)=>(
        <div className="text-white" key={index}>
            <ul className='flex items-center gap-2'>
              <li onClick={()=>nav(`/user-profile/${person.participant_name}`)}><img className='rounded-full' height={50} width={50} src={person.participant_profilePic} alt="" /></li>
              <li onClick={()=>nav(`/user-profile/${person.participant_name}`)}>{person.participant_name}</li>
            </ul>
        </div>
      ))}
      </div>
      <div className="">
        <h1 className='text-white font-thin text-2xl'>Requested</h1>
        {groupData?.groupAccess === "Private" && (
          <div className="">
          {groupData?.requested.map((request, index)=>(
            <ul key={index} className="flex text-white items-center gap-2">
              <li><img className='rounded-full' height={50} width={50} src={request.participant_profilePic}/></li>
              <li  onClick={()=>nav(`/user-profile/${request.participant_name}`)}>{request.participant_name}</li>
              <li><button onClick={()=>acceptRequest(request.participant_name)} className='bg-green-500 p-2 rounded-md'>Accept</button></li>
              <li><button onClick={()=>denyRequest(request.participant_name)} className='bg-red-500 p-2 rounded-md'>Deny</button></li>
            </ul>
          ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupMembers
