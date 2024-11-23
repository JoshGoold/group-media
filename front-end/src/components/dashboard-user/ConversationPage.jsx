import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import SendMessage from '../functions/SendMessage';
import { useState } from 'react';

const ConversationPage = () => {
    const { id, username } = useParams();
    const [data, setData] = useState({});
    const [rootUser, setRootUser] = useState({ id: null, username: null });
    const nav = useNavigate();

    async function getData() {
        const getToken = localStorage.getItem("token");
        const userid = localStorage.getItem('id');
        const username = localStorage.getItem('username');
        setRootUser({ id: userid, username: username });
        try {
            const response = await axios.get(`/api/conversation?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.data.Success) {
                console.error(response.data?.error || response.data);
                alert(response.data.Message);
            }
            console.log(response.data.data);
            setData(response.data.data);
        } catch (error) {
            console.error(error);
            alert("Server error occurred");
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div id={id} className="w-full min-h-screen flex flex-col">
            <div className="bg-white flex flex-col w-full h-[100px] p-3 mb-4">
                <div className="flex justify-between">
                    <button title="back" className="text-3xl p-2" onClick={() => nav(`/dashboard/${rootUser.username}`)}>←</button>
                    <button title={`Visit ${username}'s profile`} className="text-sm pt-4 p-2" onClick={() => nav(`/user-profile/${username}`)}>View Profile</button>
                </div>
                <div className="text-2xl text-center">{username}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {data.messages && (
                    <div className="flex flex-col gap-2">
                        {data.messages.map((msg, index) => (
                            <h1
                                className={`p-1 hover:-translate-y-1 hover:shadow-lg max-w-[50%] w-auto bg-blue-500 text-white rounded-md ${
                                    msg.sender === rootUser.id
                                        ? "self-end text-left"
                                        : "self-start text-left"
                                }`}
                                key={index}
                            >
                                {msg.content}
                            </h1>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex fixed w-full p-3 bottom-0">
                <SendMessage
                    reload={getData}
                    id={id}
                    username={username}
                />
            </div>
        </div>
    );
};

export default ConversationPage;
