import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import UserContext from "../CookieContext.jsx";
import pic from "../assets/defaultpic.png";
import CreateConversation from "./functions/CreateConversation.jsx";
import UserProfileHead from "./dashboard-user/UserProfileHead.jsx";
import UserLetter from "./dashboard-user/UserLetter.jsx";
import UserPost from "./dashboard-user/UserPost.jsx";
import Follow from "./functions/Follow.jsx";
import {jwtDecode} from 'jwt-decode';



const UserProfile = () => {
  
  const [user, setUser] = useState("")
  const getUserFromToken = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Decode the token to get the payload (username, email, etc.)
        const decodedToken = jwtDecode(token);

        console.log('Decoded Token:', decodedToken);

        // Access the username or any other property from the token
        const username = decodedToken.username;

        console.log('Decoded Username:', username);
        setUser(username)
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    } else {
      console.log('No token found in localStorage');
      return null;
    }
  };

  useEffect(()=>{
      getUserFromToken()
  },[])

  const { username } = useParams();
  const nav = useNavigate();
  const [token, setToken] = useState(undefined)
  
  

  const [following, setFollowing] = useState(false);
  const [state, setState] = useState("Letters")

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    posts: [],
    letters: [],
    profilepic: "",
    followers: [],
    following: [],
  });
  
  const [windowWidth, setWindowWidth] = useState(0);

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
    const getToken = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `https://group-media-n7igozkfp-joshs-projects-9174c388.vercel.app/user-profile?username=${username}`,
        {
          headers: {
          'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
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

  function checkFollowing() {
    try {
      const isFollowing = userData?.followers.find(
        (follower) => follower.id === user.id
      );

      if (isFollowing) {
        setFollowing(true);
      } else {
        setFollowing(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    handleUserProfile();
  }, [username]);

  useEffect(() => {
    checkFollowing();
  }, [userData]);

  return (
    <div className="p-3 overflow-scroll  hide-scrollbar h-screen">
      <button
        className="p-2 bg-blue-500 text-white font-thin rounded-lg"
        onClick={() => nav(`/dashboard/${user}`)}
      >
        Back
      </button>

      <div className="p-2 flex w-full  flex-col justify-center items-center">
        <div className="">
          <UserProfileHead userData={userData} />
          <div className="flex flex-col">
            <Follow
              followState={following}
              handleUserProfile={handleUserProfile}
              username={userData.username}
            />
            <CreateConversation username={userData.username} />
          </div>
        </div>
        {windowWidth > 1000 ? (
        <div className="flex w-full gap-2 mt-5">
          <div className="shadow-md rounded-lg bg-opacity-10  bg-white w-full p-2">
            <h1 className="font-thin text-white text-2xl">Letters</h1>
          </div>
          <div className="shadow-md w-full rounded-lg bg-opacity-10 bg-white p-2">
            <h1 className="font-thin text-white text-2xl">Posts</h1>
          </div>
        </div>
        ) : (
          <div className="text-white w-full bg-opacity-15 bg-purple-800 mt-10">
            <button onClick={()=> setState("Letters")} className="bg-slate-600 mx-1  bg-opacity-30 p-3 hover:bg-slate-500">Letters</button>
            <button onClick={()=> setState("Posts")}  className="bg-slate-600 bg-opacity-30 p-3 hover:bg-slate-500" >Posts</button>
          </div>
        )}
        {windowWidth > 1000 ? (
        <div className="flex border-t-2 mt-3  border-black w-full">
          <div className="w-full ">
            <UserLetter userData={userData} />
          </div>
          <div className="w-full  ">
            <UserPost userData={userData} />
          </div>
        </div>) :
        (
          <div className="flex border-t-2 mt-3  border-black w-full">
            {state === "Letters" && (
          <div className="w-full ">
            <UserLetter userData={userData} />
          </div>)}
          {state === "Posts" && (
          <div className="w-full  ">
            <UserPost userData={userData} />
          </div>)}
        </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
