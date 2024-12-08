import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Followers = (props) => {
    const nav = useNavigate()
    const [state,setState] = useState(false)
  return (
    <div>
      <div className='flex flex-col gap-2' onClick={()=>{
        setState(!state)
        props.setView(prev => !prev)
        }}>Followers: {props.userData?.followers?.length || 0}
          {state && (<>
          
                    {props.userData.followers.map((follower, index)=>(
                    <div title={`View ${follower.username}'s profile`} className='bg-white text-black px-2  ' key={index}>
                    
                      <p className="cursor-pointer" key={index} onClick={()=> nav(`/user-profile/${follower.username}`)} id={follower.id}>{follower.username}</p>
                   
                    
                    </div>
                ))} </>)}
        </div>
    </div>
  )
}

export default Followers
