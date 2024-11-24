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
  useEffect(() => {
    getNotifications();
  }, []);
  return (
    <div>
      {notifications.length > 0 ? (
        <ul className="flex flex-col gap-2 justify-center items-center">
          {notifications.map((notification, index) => (
            <li className="bg-purple-800 bg-opacity-40 text-white p-4 flex justify-between flex-wrap" key={index}>
              <small>{notification.content}</small>
            </li>
          ))}</ul>
      ) : (
        <h1 className="text-white mt-28 text-center">You have no notifications</h1>
        
      )}
    </div>
  );
};

export default NotificationsPage;
