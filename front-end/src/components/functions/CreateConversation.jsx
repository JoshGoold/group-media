import React from "react";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../../CookieContext";

const CreateConversation = (props) => {
  const { handleUserConversations, user } = useContext(UserContext);
  const [token, setToken] = useState(undefined)
 

  const [state, setState] = useState(false);
  const [message, setMessage] = useState("");

  async function createConversation() {
    const getToken = localStorage.getItem('token');
    try {
      if (message.length > 0) {
        const response = await axios.post(
          `${process.env.API_ROUTE}create-conversation`,
          {
            toUsername: props.username,
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
          handleUserConversations(user.username);
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
          className="bg-purple-500 rounded-md py-1 w-full text-white px-10"
          onClick={() => setState(true)}
        >
          Direct Message
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
            onClick={createConversation}
            title="Send Message"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateConversation;
