import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Post from "./dashboard-user/Post";
import Letter from "./dashboard-user/Letter";

const Home = ({ userData }) => {
  const [feed, setFeed] = useState([]);
  const [curMonth, setCurMonth] = useState("");
  const nav = useNavigate();


  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.screen.width);
    }
    // Define the handleResize function
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowWidth(window.innerWidth);
      }
    };

    // Add event listener if window is available
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      setWindowWidth(window.innerWidth); // Set initial width
    }

    // Cleanup the event listener on component unmount
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  async function getData() {
    const getToken = localStorage.getItem("token");
    try {
      const response = await axios.get(`/api/home-feed`, {
        headers: {
          Authorization: `Bearer ${getToken}`, // Include the token in the Authorization header
          "Content-Type": "application/json",
        },
      });

      if (response.data.Success) {
        setFeed(response.data.feed);
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      getRecommended();
    }
  }

  async function getRecommended() {
    const getToken = localStorage.getItem("token");
    try {
      const response = await axios.get(`/api/recomendation`, {
        headers: {
          Authorization: `Bearer ${getToken}`, // Include the token in the Authorization header
          "Content-Type": "application/json",
        },
      });
      if (response.data.Success) {
        setFeed((prevFeed) => [...response.data.recomended, ...prevFeed]);
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }


  function getMonth() {
    const date = new Date();
    setCurMonth(date.getMonth() + 1);
  }


  useEffect(() => {
    getData();
    getMonth();
  }, []);

  return (
    <div className="h-screen flex justify-center overflow-scroll">
      {feed.length > 0 ? (
        <div
          className={`p-2 ${
            windowWidth > 1000 ? "max-w-[60%]" : "w-full"
          } flex flex-col gap-3`}
        >
          {feed.map((post, index) => (
            <div key={index} className="">
              {post.recomended && (
                <>
                  {post.postImg && <Post data={post} handleUserProfile={getData} />}
                  {post.letterHead && <Letter data={post} handleUserProfile={getData}/>}
                </>
              )}
              {post.postImg && <Post data={post} handleUserProfile={getData}/>}
              {post.letterHead && <Letter data={post} handleUserProfile={getData}/>}
            </div>
          )) || "N/A"}
        </div>
      ) : (
        <h1 className="text-center text-gray-600 mt-20">Refresh Feed</h1>
      )}
    </div>
  );
};

export default Home;
