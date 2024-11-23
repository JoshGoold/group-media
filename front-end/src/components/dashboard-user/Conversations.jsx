import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import SendMessage from "../functions/SendMessage";
import { useNavigate } from "react-router-dom";

const Conversations = (props) => {
  const [convoData, setConvoData] = useState({});
  const [token, setToken] = useState(undefined);
  const nav = useNavigate();

  const conversationEndRef = useRef(null);

  useEffect(() => {
    console.log(open);
  }, [open]);

  useEffect(() => {
    console.log(props.userData);
  }, [props.userData]);

  const handleUserConversations = async () => {
    const getToken = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `/api/message-history?username=${props.user.username}`,
        {
          headers: {
            Authorization: `Bearer ${getToken}`, // Include the token in the Authorization header
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Success) {
        props.setUserData((prevState) => ({
          ...prevState,
          conversations: response.data.convos,
        }));
      } else {
        console.log(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handleUserConversations();
  }, [props.user.username]);

  // Scroll to bottom whenever the component mounts or updates
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollTop =
        conversationEndRef.current.scrollHeight;
    }
  }, [props.userData?.conversations]);

  return (
    <>
      <div className="overflow-y-auto hide-scrollbar">
        <ul>
          <li className="mt-3">
            <b className="text-white text-thin">Conversations</b>
          </li>
          <li className="flex mt-4 flex-col-reverse">
            {props.userData.conversations.map((conversation, index) => (
              <div key={index} className="bg-white rounded-md p-4 mb-3">
                <h1
                  className="text-center flex flex-col  items-center gap-1 font-bold mb-3"
                  onClick={() => {
                    setConvoData({
                      id: conversation.convoID,
                      username: conversation.head,
                    });
                    nav(`/dashboard/conversation/${conversation.convoID}/${conversation.head}`)
                  }}
                >
                  <span>{conversation.head}</span>
                    <small className="text-gray-400 flex items-center font-thin">
                      {conversation?.msgs[conversation?.msgs?.length - 1].split(
                        ":"
                      )[0] === "You"
                        ? ""
                        : "🔵"}
                      &nbsp;{" "}
                      {conversation?.msgs[conversation?.msgs?.length - 1]}
                    </small>
                </h1>
              </div>
            )) || "N/A"}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Conversations;
