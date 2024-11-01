import React from "react";
import { useState, useContext, useEffect } from "react";
import axios from "axios";


const CreateGroupConversation = ({groupid, handleGroupConversations}) => {

  const [state, setState] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(undefined)
  

  async function createGroupConversation() {
    const getToken = localStorage.getItem('token');
    try {
      if (message.length > 0) {
        const response = await axios.post(
          "https://group-media-mvuqkmvh6-joshs-projects-9174c388.vercel.app/create-group-conversation",
          {
            groupid: groupid,
            message: message,
          },
          {
            headers: {
            'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
            'Content-Type': 'application/json'
          }}
        );
        if (response.data.Success) {
          alert("Conversation created successfully");
          handleGroupConversations();
          setState(false);
        } else {
          alert(response.data);
        }
      } else {
        alert("You must send a message");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      {!state && (
        <button
          className="bg-purple-500 rounded-md py-1 text-white px-10"
          onClick={() => setState(true)}
        >
          Create Group Conversation
        </button>
      )}
      {state && (
        <div className="">
          <input
            className="border-gray-400 border rounded-md p-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder="Send message"
          />
          <button
            className="bg-purple-500 p-2 rounded-md text-white"
            onClick={createGroupConversation}
            title="Send Message"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateGroupConversation;
