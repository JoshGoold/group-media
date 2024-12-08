import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcLikePlaceholder, FcLike } from "react-icons/fc";

const Modal = ({ isOpen, onClose, postData, onCommentSubmit, commentValue, setCommentValue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-96 max-h-[80vh] overflow-y-auto">
        <button className="text-right text-red-500" onClick={onClose}>
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">Post Details</h2>
        
        {/* Likes Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Likes:</h3>
          {postData.likes.length > 0 ? (
            <ul>
              {postData.likes.map((like, index) => (
                <li key={index} className="text-gray-700">
                  {like.likerUsername}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No likes yet.</p>
          )}
        </div>

        {/* Comments Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Comments:</h3>
          {postData.comments.length > 0 ? (
            <ul>
              {postData.comments.map((comment, index) => (
                <li key={index} className="text-gray-700">
                  <strong>{comment.commenterUsername}: </strong>
                  {comment.comment}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {/* Add Comment Section */}
        <form onSubmit={onCommentSubmit} className="flex flex-col gap-2">
          <textarea
            className="border border-gray-300 rounded-md p-2"
            placeholder="Add a comment..."
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal