import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Following = (props) => {
  const nav = useNavigate();
  const [state, setState] = useState(false);
  return (
    <div>
      <div
      className="flex flex-col gap-2"
       onClick={() =>{
        setState(!state)
        props.setView(prev => !prev)
        }}>
        Following: {props.userData?.following?.length || 0}
        {state && (<>
        {props.userData.following.map((follow, index) => (
          <div className='bg-white text-black px-2  ' title={`View ${follow.username}'s profile`} key={index}>
            
              <p
              className="cursor-pointer"
                key={index}
                onClick={() => nav(`/user-profile/${follow.username}`)}
                id={follow.id}
              >
                {follow.username}
              </p>
            
          </div>
        ))}</>)}
      </div>
    </div>
  );
};

export default Following;
