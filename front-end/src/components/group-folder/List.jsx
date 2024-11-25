import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const List = ({ category }) => {
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState(false)
  const [rootUser, setRootUser] = useState({id: null, username: null});
  async function joinGroup(id) {
    const getToken = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `/api/join-group`,
        {
          groupid: id,
        },
        {
          headers: {
          'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(response.data.Message);
        getGroups();
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function requestGroup(id) {
    const getToken = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `/api/request-group`,
        {
          groupid: id,
        },
        {
          headers: {
          'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(response.data.Message);
        getGroups();
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function getGroups() {
    const getToken = localStorage.getItem("token");
    const userid = localStorage.getItem('id')
    const username = localStorage.getItem('username')
     
    setRootUser({id: userid, username: username})
    try {
      const response = await axios.get(`/api/groups-list?type=${category}`, {
        headers: {
          Authorization: `Bearer ${getToken}`, // Include the token in the Authorization header
          "Content-Type": "application/json",
        },
      });
      if (!response.data.Success) {
        alert(response.data.Message);
        setMessage(response.data.Message);
        console.error(response.data);
      }
      setGroups(response.data.groups);
    } catch (error) {
      console.error(error);
      alert("No groups found");
    }
  }
  const nav = useNavigate();
  useEffect(() => {
    getGroups();
  }, [category]);
  return (
    <div className="   w-[70%] flex flex-col gap-3 ml-auto mr-auto">
      {groups.map((group, index) => (
        <div
          onClick={() => {
            const isMatch = group.participants.find((participant)=> participant.participant_name === rootUser.username);
            isMatch ? setState(true) : setState(false)
            if (group.groupAccess === "Public" || state) {
              nav(
                `/dashboard/${rootUser.username}/groups/${group.groupName}/${String(
                  group._id
                )}/1`
              );
            }
          }}
          key={index}
          className="bg-white p-3 rounded-md cursor-pointer"
        >
          <div className="flex gap-2 my-2 items-center">
            <img
              className="rounded-full"
              src={group.groupProfilePicture}
              height={100}
              width={100}
            />
            <h1 className="font-bold text-2xl">{group.groupName}</h1>
          </div>
          <p className="my-2">{group.groupDescription}</p>
          {group.participants.find(
            (participant) => participant.participant_name === rootUser.username
          ) ? (
            ""
          ) : (
            <div className="my-3">
              {group.groupAccess === "Private" ? (
                <button
                  onClick={() => requestGroup(group._id)}
                  className="text-white bg-blue-500 p-2 rounded-md"
                >
                  {group?.requested_participants.find(
                    (participant) => participant.participant_name === rootUser.username
                  )
                    ? "Requested"
                    : "Request"}
                </button>
              ) : (
                <button
                  onClick={() => joinGroup(group._id)}
                  className="text-white bg-blue-500 p-2 rounded-md"
                >
                  Join
                </button>
              )}
            </div>
          )}
          <ul className="flex justify-between">
            <li>
              {group?.participants?.length || 0}/{group.memberCount} Members
            </li>
            <li>{group.groupAccess}</li>
          </ul>
        </div>
      ))|| "No groups found"}
    </div>
  );
};

export default List;
