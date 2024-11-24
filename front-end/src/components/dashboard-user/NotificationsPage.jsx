import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";

const NotificationsPage = ({amount}) => {
  const [notifications, setNotifications] = useState([]);
  async function getNotifications() {
    const getToken = localStorage.getItem("token");
    try {
      const response = await axios.get("/api/notifications", {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.data.Success) {
        alert(response.data.Message);
      }
      setNotifications(response.data.notifications);
      amount(response.data.notifications.length)
    } catch (error) {
      console.error(error);
    }
  }
  async function deleteNotifications(){
    const getToken = localStorage.getItem("token");
    try {
        const response = await axios.delete("/api/notifications", {
            headers: {
              Authorization: `Bearer ${getToken}`,
              "Content-Type": "application/json",
            },
          });
          if(!response.data.Success){
            alert(response.data.Message)
          }
          alert(response.data.Message)
    } catch (error) {
        console.error("Error deleting notifications ",error)
    }
  }
  useEffect(() => {
    getNotifications();
  }, []);
  return (
    <div className="p-3">
        <button className="text-white bg-red-600 bg-opacity-30 p-1 rounded-md" onClick={()=> {setNotifications([])
            amount(0)
            deleteNotifications()
        }}>Clear Notifications</button>
      {notifications.length > 0 ? (
        <ul className="flex flex-col gap-2 justify-center items-center">
          {notifications.map((notification, index) => (
            <li className="bg-purple-800 bg-opacity-40 min-w-[400px] text-white p-4 flex-col flex flex-wrap" key={index}>
              <small>{notification.content}</small>
              <small>"{notification.subject}"</small>
            </li>
          ))}</ul>
      ) : (
        <h1 className="text-white mt-28 text-center">You have no notifications</h1>
        
      )}
    </div>
  );
};

export default NotificationsPage;
