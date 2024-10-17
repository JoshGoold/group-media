import React, { useState, useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import UserContext from "../CookieContext.jsx";
import pic from "../assets/defaultpic.png";
import Sidepanel from "./dashboard-user/Sidepanel.jsx";
import { useParams } from "react-router-dom";
import Home from "./Home.jsx";
import Profile from "./Profile.jsx";
import Groups from "./group-folder/Groups.jsx";



const Dashboard = () => {
  const { user } = useContext(UserContext);

  const { username } = useParams();


  const [userData, setUserData] = useState({
    username: "",
    email: "",
    conversations: [],
    posts: [],
    letters: [],
    profilepic: pic,
    followers: [],
    following: [],
  });

  const [navState, setNavState] = useState({
    home: false,
    conversations: false,
    profile: true,
    globalGroups: false
  })

  const [windowWidth, setWindowWidth] = useState(0);
  const [state, setState] = useState("Letters")
  const [sideState, setSideState] = useState(false)



  
  useEffect(() => {
    
    if(typeof window !== 'undefined'){
    setWindowWidth(window.screen.width)
  }
    // Define the handleResize function
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
      }
    };
  
    // Add event listener if window is available
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      setWindowWidth(window.innerWidth); // Set initial width
    }
  
    // Cleanup the event listener on component unmount
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const handleUserProfile = async () => {
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3003/user-profile?username=${username}`,{
          headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );

      if (response.data.Success) {
        setUserData((prevState) => ({
          ...prevState,
          username: response.data.user.username,
          email: response.data.user.email,
          posts: response.data.user.posts,
          letters: response.data.user.letters,
          profilepic: response.data.user.profilepic,
          followers: response.data.user.followers,
          following: response.data.user.following,
        }));
      } else {
        alert("An error occurred while loading the page");
        console.log(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch user profile and conversations
  useEffect(() => {
    handleUserProfile();
  }, [username]);

  return (
    <div className="flex w-full  h-screen">
      {windowWidth > 1000 ? (
        <div className="flex-2 small-sidepanel">
          <Sidepanel setSideState={setSideState} navState={navState} setNavState={setNavState} userData={userData} setUserData={setUserData} user={user} />
        </div>
      ) : (
      <div className="">
        <div className="">
          <button onClick={()=> setSideState(!sideState)} className="text-4xl hover:scale-110 hover:text-purple-600 duration-200 text-purple-400 fixed top-0 right-3">≣</button>
        </div>
        {sideState && (
          <div className="w-full h-screen">
          <Sidepanel setSideState={setSideState} navState={navState} setNavState={setNavState} userData={userData} setUserData={setUserData} user={user} />
          </div>
        )}
        </div>
      )}
      <div className="w-full">
        {navState.home && (
          <div className="">
            <Home userData={userData} handleUserProfile={handleUserProfile}/>
          </div>
        )}
        {navState.profile && (
          <div className="w-full">
            <Profile/>
          </div>
        )}
        {navState.globalGroups && (
          <div className="">
            <Groups />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
