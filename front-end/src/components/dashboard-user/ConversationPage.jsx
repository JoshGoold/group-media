import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import SendMessage from '../functions/SendMessage';
import { useState } from 'react';

const ConversationPage = () => {
    const {id, username} = useParams();
    const [data, setData] = useState({});
    const [rootUser, setRootUser] = useState({id: null, username: null});
    const nav = useNavigate();

    async function getData(){
        const getToken = localStorage.getItem("token");
        const userid = localStorage.getItem('id')
        const username = localStorage.getItem('username')
        setRootUser({id: userid, username: username})
        try {
            const response = await axios.get(`/api/conversation?id=${id}`,{
                headers: {
                  Authorization: `Bearer ${getToken}`, // Include the token in the Authorization header
                  "Content-Type": "application/json",
                },
              })
            if(!response.data.Success){
                console.error(response.data?.error || response.data)
                alert(response.data.Message)
            }
            console.log(response.data.data)
            setData(response.data.data)
        } catch (error) {
            console.error(error)
            alert("Server error occured")
        }
    }
    useEffect(()=>{
        getData();
    },[])
  return (
          <div id={id} className="w-full h-full relative ">
            <div className="absolute top-0 left-0"><button title='back' className='text-3xl text-white p-2' onClick={()=> nav(`/dashboard/${rootUser.username}`)}>←</button></div>
            <div className="absolute top-0 right-0"><button title={`Visit ${username}'s profile`} className='text-sm pt-4 text-white p-2' onClick={()=> nav(`/user-profile/${username}`)}>View Profile</button></div>

            <div className="bg-white flex flex-col justify-center items-center bg-opacity-75 w-full h-[150px] mb-4">
                <div className="text-2xl text-white">{username}</div>
            </div>
            <div className="">
                { data.messages && (

                
              <div className="flex flex-col p-3 gap-2">
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
              </div>)}
            </div>

            <div className="flex absolute w-full p-3 bottom-0">
        
              <SendMessage
                reload={getData}
                id={id}
                username={username}
              />
            </div>
          </div>
  )
}

export default ConversationPage
