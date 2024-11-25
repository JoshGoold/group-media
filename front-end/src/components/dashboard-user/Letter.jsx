import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateLetter from "../functions/CreateLetter";
import { FcLikePlaceholder, FcLike } from "react-icons/fc";


const Letter = (props) => {
  const [curMonth, setCurMonth] = useState("");
  const [token, setToken] = useState(undefined)
 
  const [editState, setEditState] = useState({
    state: false,
    letterid: "",
    content: "",
    title: "",
  });
  const [commentL, setCommentL] = useState("");
  const [likeState, setLikeState] = useState({ state: false, id: "" });
  const [commentState, setCommentState] = useState({ state: false, id: "" });

  const [username, setUsername] = useState("")
  const nav = useNavigate();

  const commentLetter = async (e, id, username, comment) => {
    const getToken = localStorage.getItem('token');
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/comment-letter`,
        {
          letterId: id,
          profileUsername: username,
          comment: comment,
        },
        {
          headers: {
          'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(response.data.Message);
        props.handleUserProfile();
        setCommentL("");
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const likeLetter = async (letter_id, username) => {
    const getToken = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `/api/like-letter`,
        {
          letterId: letter_id,
          profileUsername: username,
        },
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
  };

  async function deleteLetter(id) {
    const getToken = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `/api/delete-letter`,
        {
          id: id,
        },
        {
          headers: {
          'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
      );
      if (response.data.Success) {
        alert(response.data.Message);
        props.handleUserProfile();
        window.location.reload();
      } else {
        alert(response.data.Message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function editLetter() {
    const getToken = localStorage.getItem('token');
    if (
      editState.letterid.length > 0 &&
      editState.title.length > 0 &&
      editState.content.length > 0
    ) {
      try {
        const response = await axios.post(
          `/api/edit-letter`,
          {
            id: editState.letterid,
            title: editState.title,
            content: editState.content,
          },
          {
            headers: {
            'Authorization': `Bearer ${getToken}`, // Include the token in the Authorization header
            'Content-Type': 'application/json'
          }}
        );
        if (response.data.Success) {
          props.handleUserProfile();
          window.location.reload();
        } else {
          alert(response.data.Message);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Please fill in all available fields");
    }
  }

  useEffect(() => {
    getMonth();
    const rootUsername = localStorage.getItem('username'); 
    setUsername(rootUsername)
  }, []);
  function getMonth() {
    const date = new Date();
    const month = date.getMonth();
    setCurMonth(month);
  }

  return (
    <div>
      {props?.data?.feed || props?.data?.reccomended ? (
        <div className="p-2 flex flex-col gap-3">
          <div
            className="border-t-gray-300 shadow-md rounded-md p-3 bg-white border"
            id={props.data._id}
          >
            <h1 className="text-sm font-thin">{props.data.reccomended && "Recommended"}</h1>
            <h1 onClick={()=> nav(`/user-profile/${props.data.username}`)} className="text-2xl py-2 cursor-pointer hover:underline font-thin">{props.data.username}</h1>
            <div className=" font-bold flex justify-between items-center  text-2xl">
                  <h1>{props.data.letterHead}</h1>
                  
                </div>
                <div className="">
                  <p>{props.data.letterContent}</p>
                  <small className="text-sm text-gray-400 font-thin">
                    {curMonth}/{props.data.createdAt}
                  </small>
                </div>
            <div className="flex mt-10 justify-between">
              <div className="">
              <small
                onClick={() =>
                  setLikeState({ state: !likeState.state, id: props.data._id })
                }
              >
                {props?.data?.likes?.length > 0
                  ? props.data.likes.length
                  : 0}{" "}
                Likes:</small>
                <button
                  onClick={() => likeLetter(props.data._id, props.data.username)}
                >
                  {props.data.likes.find(like => like.likerUsername === username) ? <FcLike/> : <FcLikePlaceholder/>}
                </button>
                {props.data?.likes.map((like, index) => (
                  <div key={index} className="">
                    {likeState.state && (
                      <div className="">
                        {likeState.id === props.data._id && (
                          <div key={index}>
                            <h1>{like.likerUsername}</h1>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )) || 0}</div>
              
              <div className="items-center">
              <small
                    onClick={() => {
                      setCommentState({
                        state: !commentState.state,
                        id: props.data._id,
                      });
                    }}
                    className="font-thin"
                  >
                    {props?.data?.comments?.length > 0
                      ? props.data.comments.length
                      : 0}{" "}
                    Comments
                  </small>
                <form
                  onSubmit={(e) =>
                    commentLetter(
                      e,
                      props.data._id,
                      props.data.username,
                      commentL
                    )
                  }
                >
                  <input
                    className="border border-gray-400 rounded-md p-1"
                    value={commentL}
                    onChange={(e) => setCommentL(e.target.value)}
                    type="text"
                    placeholder="Leave a comment"
                  />
                  <button type="submit">📩</button>
                </form>
                </div>
              </div>
                {props.data.comments?.map((comment, index) => (
                  <div key={index} className="">
                    {commentState.state && (
                      <div className="">
                        {commentState.id === props.data._id && (
                          <div className="shadow-sm flex mb-1 rounded-md border-t-gray-300 border border-l-gray-300 gap-2 p-2" id={comment._id} key={index}>
                            <h1>{comment.commenterUsername}</h1>
                            <h2>{comment.comment}</h2>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )) || 0}
               </div>
        </div>
      )
      :
      (
        <div>
      {props.userData?.letters?.length > 0 ? (
        <div className="flex flex-col-reverse gap-3">
          {props.userData.letters.map((letter, index) => (
            <div className="bg-white bg-opacity-10" id={letter._id} key={index}>
              <div className="border-t-gray-300 bg-white shadow-md rounded-md p-3 border">
                <div className=" font-bold flex justify-between items-center  text-2xl">
                  <h1>{letter.letterHead}</h1>
                  <span className="flex items-center gap-2">
                    <button
                      className="hover:scale-110 text-sm rounded-full "
                      onClick={() => deleteLetter(String(letter._id))}
                      title="Delete Letter"
                    >
                      🔴
                    </button>
                    <button
                      className="hover:scale-110 text-sm rounded-full "
                      onClick={() =>
                        setEditState((prev) => ({
                          ...prev,
                          state: true,
                          letterid: letter._id,
                        }))
                      }
                      title="Edit Letter"
                    >
                      🟠
                    </button>
                  </span>
                </div>
                <div className="">
                  <p>{letter.letterContent}</p>
                  <small className="text-sm text-gray-400 font-thin">
                    {curMonth}/{letter.createdAt}
                  </small>
                </div>
                <div className="flex mt-10 justify-between">
                  <div>
                    <small
                      onClick={() =>
                        setLikeState({
                          state: !likeState.state,
                          id: letter._id,
                        })
                      }
                      className="font-thin"
                    >
                      {props?.userData?.letters[index]?.likes?.length || 0}{" "}
                      Likes{" "}
                    </small>
                    <button
                      title="Like"
                      onClick={() =>
                        likeLetter(letter._id, props.userData.username)
                      }
                    >
                      {letter.likes.find(like => like.likerUsername === username) ? <FcLike/> : <FcLikePlaceholder/>}
                    </button>
                    {letter?.likes.map((like, index) => (
                      <div key={index} className="">
                        {likeState.state && (
                          <div className="">
                            {letter._id === likeState.id && (
                              <div key={index}>
                                <h1>{like.likerUsername}</h1>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )) || 0}
                  </div>
                  <div className="items-center">
                    <small
                      onClick={() => {
                        setCommentState({
                          state: !commentState.state,
                          id: letter._id,
                        });
                      }}
                      className="font-thin"
                    >
                      {props?.userData?.letters[index]?.comments?.length > 0
                        ? props.userData.letters[index].comments.length
                        : 0}{" "}
                      Comments
                    </small>
                    <form
                      onSubmit={(e) =>
                        commentLetter(
                          e,
                          letter._id,
                          props.userData.username,
                          commentL
                        )
                      }
                    >
                      <input
                        className="border border-gray-400 rounded-md p-1"
                        onChange={(e) => setCommentL(e.target.value)}
                        type="text"
                        placeholder="Leave a comment"
                      />
                      <button type="submit">📩</button>
                    </form>
                  </div>
                </div>
                <div className="">
                  {commentState.state && (
                    <div className="">
                      {commentState.id === letter._id && (
                        <div className="w-full">
                          {letter?.comments.map((comment, index) => (
                            <div
                              className="shadow-sm flex mb-1 rounded-md border-t-gray-300 border border-l-gray-300 gap-2 p-2"
                              id={comment._id}
                              key={index}
                            >
                              <small
                                onClick={() =>
                                  nav(
                                    `/user-profile/${comment.commenterUsername}`
                                  )
                                }
                              >
                                {comment.commenterUsername}
                              </small>
                              <h1>{comment.comment}</h1>
                            </div>
                          )) || 0}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) || "N/A"}
          {editState.state && (
            <div className="flex fixed a-center p-10 bg-white shadow-lg flex-col border border-gray-400 w-96 rounded-md">
              <input
                className="border text-2xl text-black rounded-md p-1 border-gray-300"
                placeholder="Title"
                onChange={(e) =>
                  setEditState((prev) => ({ ...prev, title: e.target.value }))
                }
                type="text"
              />
              <textarea
                className="border text-black rounded-md p-1 border-gray-300"
                placeholder="Contents here"
                onChange={(e) =>
                  setEditState((prev) => ({ ...prev, content: e.target.value }))
                }
                cols={20}
                rows={10}
                type="text"
              />
              <button
                className="bg-green-500 text-white"
                onClick={() => editLetter()}
              >
                Update
              </button>
              <button
                className="bg-red-500 text-white"
                onClick={() =>
                  setEditState((prev) => ({ ...prev, state: false }))
                }
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <h1 className="text-center text-gray-600 mt-20">
          User has no letters yet
        </h1>
      )}</div>)}
    </div>
  );
};

export default Letter;
