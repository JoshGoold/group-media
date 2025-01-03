import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const nav = useNavigate();

  const [query, setQuery] = useState("");
  const [userList, setUserList] = useState([]);

  async function userSearch() {
    try {
      const response = await axios.get(
        `/api/user-search?searchQuery=${query}`
      );
      if (response.data.Message === "Success") {
        setUserList(response.data.list);
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query.length > 0) {
      userSearch();
    }
    if (query.length === 0){
      setUserList([])
    }
  }, [query]);
  return (
    <div className="w-full">
      <input
        className="rounded-md w-full mb-2 p-2"
        type="text"
        list="users"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users"
      />
      {userList.length > 0 ? (
        <ul className="user-list">
          {userList.map((person) => (
            <li
              className="bg-white flex justify-between p-2 border-black border"
              key={person._id}
            >
              <span>{person.username}</span>
              <button
                className="text-sm"
                onClick={() => nav(`/user-profile/${person.username}`)}
              >
                View Profile
              </button>
            </li>
          ))}
        </ul>
      ): (<p className="text-white">No users found</p>)}
    </div>
  );
};

export default Search;
