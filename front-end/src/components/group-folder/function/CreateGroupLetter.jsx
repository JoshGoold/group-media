import React from "react";
import { useState, useContext, useEffect } from "react";
import axios from "axios";

const CreateGroupLetter = ({getData, groupid}) => {
  const [state, setState] = useState(false);
  const [letter, setLetter] = useState({ title: "", content: "" });
  const [token, setToken] = useState(undefined)
  useEffect(()=>{
    const getToken = localStorage.getItem('token');
    setToken(getToken)
  },[])

  async function createLetter() {
    if (letter.title === "" || letter.content === "") {
      return alert("Must fill in all available fields");
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3003/new-group-letter",
          {
            title: letter.title,
            contents: letter.content,
            groupid: groupid
          },
          {
            headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
            'Content-Type': 'application/json'
          }}
        );

        if (response.data.Success) {
          alert(response.data.Message);
          setState(false);
          getData()
          window.location.reload();
        } else {
          alert(response.data);
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <div>
      {!state && (
        <div className="mt-3 text-right">
          <button
            className="bg-blue-500 text-white font-thin p-2 rounded-sm"
            onClick={() => setState(true)}
          >
            New Letter
          </button>
        </div>
      )}
      {state && (
        <div className="flex fixed a-center p-10 bg-white shadow-lg flex-col border border-gray-400 w-96 rounded-md">
          <input
            className="border text-2xl text-black rounded-md p-1 border-gray-300"
            placeholder="Title"
            onChange={(e) =>
              setLetter((prev) => ({ ...prev, title: e.target.value }))
            }
            type="text"
          />
          <textarea
            className="border text-black rounded-md p-1 border-gray-300"
            placeholder="Contents here"
            onChange={(e) =>
              setLetter((prev) => ({ ...prev, content: e.target.value }))
            }
            cols={20}
            rows={10}
            type="text"
          />
          <button className="bg-green-500 text-white" onClick={createLetter}>
            Post
          </button>
          <button
            className="bg-red-500 text-white"
            onClick={() => setState(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateGroupLetter;
