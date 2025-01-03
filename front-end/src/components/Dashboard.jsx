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
import NotificationsPage from "./dashboard-user/NotificationsPage.jsx";
import SearchPage from "./dashboard-user/SearchPage.jsx";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const { username } = useParams();
  
  const [notifAmount, setNotifAmount] = useState(0);

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
    globalGroups: false,
    notifications: false,
    search: false
  });

  const [windowWidth, setWindowWidth] = useState(0);
  const [state, setState] = useState("Letters");
  const [sideState, setSideState] = useState(false);

  // Client-side specific logic for window resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.screen.width);
    }

    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowWidth(window.innerWidth);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      setWindowWidth(window.innerWidth); // Set initial width
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Handle fetching user profile data
  const handleUserProfile = async () => {
    try {
      if (typeof window !== "undefined") { // Ensure client-side execution
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/user-profile?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
              "Content-Type": "application/json",
            },
          }
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleUserProfile();
  }, [username]);

  return (
    <div className="flex w-full h-screen">
      {windowWidth > 1000 ? (
        <div className="flex-2 small-sidepanel">
          <Sidepanel
            setSideState={setSideState}
            navState={navState}
            setNavState={setNavState}
            userData={userData}
            setUserData={setUserData}
            user={user}
            notifAmount={notifAmount}
          />
        </div>
      ) : (
        <div className="">
          <div className="">
            <button
              onClick={() => setSideState(!sideState)}
              className="text-4xl hover:scale-110 hover:text-purple-600 duration-200 text-purple-400 fixed top-0 right-3"
            >
              ≣
            </button>
          </div>
          {sideState && (
            <div className="w-full h-screen">
              <Sidepanel
                setSideState={setSideState}
                navState={navState}
                setNavState={setNavState}
                userData={userData}
                setUserData={setUserData}
                user={user}
              />
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        {navState.home && (
          <div className="">
            <Home userData={userData} handleUserProfile={handleUserProfile} />
          </div>
        )}
        {navState.profile && (
          <div className="w-full">
            <Profile />
          </div>
        )}
        {navState.globalGroups && (
          <div className="">
            <Groups />
          </div>
        )}
        {navState.notifications && (
          <div className="">
            <NotificationsPage amount={setNotifAmount}/>
          </div>
        )}
        {navState.search && (
          <div className="p-4">
            <SearchPage/>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
