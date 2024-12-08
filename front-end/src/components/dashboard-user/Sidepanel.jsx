import React from "react";
import Search from "../functions/Search";
import Conversations from "./Conversations";
import Logout from "../registry/Logout";
import NavBar from "../NavBar";
import pic from '../../../public/social-netowork.png'

const Sidepanel = (props) => {
  return (
    <div className="flex flex-col items-center bg-white bg-opacity-10 overfolow-y-auto p-3 h-full">
      <img className="h-[50px] w-[50px]" src={pic}></img>
      <NavBar amount={props.notifAmount} setSideState={(props.setSideState)} setNavState={props.setNavState} navState={props.navState}/>

      {props.navState.conversations === true && (
        <Conversations
        userData={props.userData}
        setUserData={props.setUserData}
        user={props.user}
      />
      )}
      <div className="ml-auto mr-auto">
        <Logout />
      </div>
    </div>
  );
};

export default Sidepanel;
