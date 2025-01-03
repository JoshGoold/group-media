import React from "react";
import { useState, useContext, useEffect } from "react";
import axios from "axios";

const CreateLetter = (props) => {
  const [state, setState] = useState(false);
  const [letter, setLetter] = useState({ title: "", content: "" });
  const [token, setToken] = useState(undefined)
  

  async function createLetter() {
    const getToken = localStorage.getItem('token');
    if (letter.title === "" || letter.content === "") {
      return alert("Must fill in all available fields");
    } else {
      try {
        const response = await axios.post(
          `/api/new-letter`,
          {
            title: letter.title,
            contents: letter.content,
          },
          {
            headers: {
            'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
            'Content-Type': 'application/json'
          }}
        );

        if (response.data.Success) {
          alert(response.data.Message);
          setState(false);
          props.handleUserProfile();
          window.location.reload();
        } else {
          alert(response.data);
        }
      } catch (error) {}
    }
  }

  return (
    <div>
      {!state && (
        <div className="mt-3">
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

export default CreateLetter;
