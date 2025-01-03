import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import axios from "axios";

const GroupType = () => {
  const nav = useNavigate();
  const [token, setToken] = useState(undefined)
  
  const { username, grouptype, groupcategory } = useParams();
  const [state, setState] = useState(false);
  const [group, setGroup] = useState({
    group_name: "",
    group_description: "",
    catergory: grouptype,
    type: groupcategory,
    member_count: "",
    access: "",
  });
  const [groups, setGroups] = useState([]);

  async function getGroups() {
    const getToken = localStorage.getItem('token');

    setToken(getToken)
    try {
      const response = await axios.get(
        `/api/groups?category=${grouptype}`,
        {
          headers: {
          'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        setGroups(response.data.groups);
      } else {
        alert(response.data.Message);
        console.log(response.data.message);
      }
    } catch (error) {
      console.error(`Server Error --> ${error}`);
    }
  }

  useEffect(() => {
    getGroups();
  }, [grouptype]);

  async function createGroup(e) {
    e.preventDefault();
    if (
      group.group_name === "" ||
      group.group_description === "" ||
      group.access === ""
    ) {
      return alert("Must fill in all available fields");
    }
    try {
      const response = await axios.post(
        `/api/create-group`,
        {
          group_name: group.group_name,
          group_description: group.group_description,
          type: group.type,
          memberCount:
            group.member_count === "" ? undefined : group.member_count,
          category: group.catergory,
          access: group.access,
        },
        {
          headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(`Group: ${group.group_name} created successfully!`);
        getGroups();
        window.location.reload();
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(`Server Error --> ${error}`);
    }
  }
  async function joinGroup(id) {
    try {
      const response = await axios.post(
        `/api/join-group`,
        {
          groupid: id,
        },
        {
          headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(response.data.Message);
        getGroups();
        window.location.reload();
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function requestGroup(id) {
    try {
      const response = await axios.post(
        `/api/request-group`,
        {
          groupid: id,
        },
        {
          headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(response.data.Message);
        getGroups();
        window.location.reload();
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="p-3 overflow-scroll h-screen hide-scrollbar">
      <div className="flex justify-between p-4">
        <div
          className="text-white text-3xl"
          onClick={() => nav(`/dashboard/${username}`)}
        >
          <FaHome />
        </div>
        <div className="">
          <h1 className="text-white lg:text-3xl font-thin">
            Welcome to the {grouptype} lounge
          </h1>
        </div>
      </div>
      <div className="">
        {!state && (
          <button
            className="text-white bg-blue-500 lg:p-2 p-1 rounded-md"
            onClick={() => setState(true)}
          >
            Create Group
          </button>
        )}
      </div>
      <div className="flex justify-center p-3 ">
        {state && (
          <form
            onSubmit={(e) => createGroup(e)}
            className="bg-white flex flex-col gap-4 lg:w-[50%] p-10 rounded-md shadow-md shadow-black"
          >
            <ul className="flex gap-4 flex-col">
              <li className="flex flex-col">
                <label htmlFor="name">Group Name</label>
                <input
                  className="border-gray-400 border"
                  id="name"
                  required
                  type="text"
                  placeholder="Group Name"
                  onChange={(e) =>
                    setGroup((prev) => ({
                      ...prev,
                      group_name: e.target.value,
                    }))
                  }
                />
              </li>
              <li className="flex flex-col">
                <label htmlFor="desc">Group Description</label>
                <textarea
                  className="border-gray-400 border"
                  id="desc"
                  required
                  type="text"
                  placeholder="Group Description"
                  onChange={(e) =>
                    setGroup((prev) => ({
                      ...prev,
                      group_description: e.target.value,
                    }))
                  }
                />
              </li>
            </ul>
            <div className="flex items-center gap-2">
              <label htmlFor="acs">Accessibility:</label>
              <select
                onChange={(e) =>
                  setGroup((prev) => ({ ...prev, access: e.target.value }))
                }
                name="Accessibility"
                id="acs"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="count">Max Members:</label>
              <input
                className="border-gray-400 border"
                placeholder="Maximum Members"
                onChange={(e) =>
                  setGroup((prev) => ({
                    ...prev,
                    member_count: e.target.value,
                  }))
                }
                type="number"
                max={300}
              />
            </div>
            <div className="flex items-center justify-center text-white gap-2">
              <button className="bg-blue-500 p-2 rounded-md" type="submit">
                Create
              </button>
              <button
                className="bg-red-500 p-2 rounded-md"
                onClick={() => setState(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="">
        {groups.length > 0 ? (
          <div className="   w-[70%] flex flex-col gap-3 ml-auto mr-auto">
            {groups.map((group, index) => (
              <div
                onClick={() => {
                  if (group.groupAccess === "Public") {
                    nav(
                      `/dashboard/${username}/groups/${
                        group.groupName
                      }/${String(group._id)}/1`
                    );
                  }
                }}
                key={index}
                className="bg-white p-3 rounded-md cursor-pointer"
              >
                <div className="flex gap-2 my-2 items-center">
                  <img
                    className="rounded-full"
                    src={group.profilepic}
                    height={100}
                    width={100}
                  />
                  <h1 className="font-bold text-2xl">{group.groupName}</h1>
                </div>
                <p className="my-2">{group.groupDescription}</p>
                {group.participants.find(
                  (participant) => participant.participant_name === username
                ) ? (
                  ""
                ) : (
                  <div className="my-3">
                    {group.groupAccess === "Private" ? (
                      <button
                        onClick={() => requestGroup(group._id)}
                        className="text-white bg-blue-500 p-2 rounded-md"
                      >
                        {group?.requested_participants.find(participant=> participant.participant_name === username) ? "Requested" : "Request"}
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
                    {group?.participants?.length || 0}/{group.memberCount}{" "}
                    Members
                  </li>
                  <li>{group.groupAccess}</li>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center mt-10">
            No Groups found. Create one now!
          </p>
        )}
      </div>
    </div>
  );
};

export default GroupType;
