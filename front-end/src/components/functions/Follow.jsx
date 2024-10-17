import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";

const Follow = (props) => {
  const [token, setToken] = useState(undefined)
 
  async function follow() {
    const getToken = localStorage.getItem('token');
    if (!props.followState) {
      try {
        const response = await axios.get(
          `http://localhost:3003/follow?username=${props.username}`,
          {
            headers: {
            'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
            'Content-Type': 'application/json'
          }}
        );
        if (response.data.Success) {
          alert(response.data.Message);
          props.handleUserProfile();
        } else {
          alert(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <div className="my-3">
      <button
        onClick={follow}
        className="bg-blue-500 rounded-md p-1 w-full text-white px-10"
      >
        {props.followState ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default Follow;
