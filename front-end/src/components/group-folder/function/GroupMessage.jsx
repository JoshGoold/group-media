import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
const GroupMessage = (props) => {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(undefined)
  

  async function sendMessage() {
    const getToken = localStorage.getItem('token');
    if (message.length > 0) {
      try {
        const response = await axios.post(
          `/api/group-message`,
          {
            message: message,
            groupid: props.id,
          },
          {
            headers: {
            'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
            'Content-Type': 'application/json'
          }}
        );
        if (response.data.Success) {
          alert(`Message Sent to ${props.username}`);
          setMessage("");
          props.reload();
        } else {
          alert(response.data);
          setMessage("");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Cannot send a message with no characters");
    }
  }
  return (
    <div className="text-center w-full flex">
      <input
        value={message}
        placeholder="Send message"
        className="border-gray-400 border p-1 w-full rounded-md"
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        id=""
      />
      <button
        className="bg-blue-500 text-white p-1 rounded-md"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
};

export default GroupMessage;
