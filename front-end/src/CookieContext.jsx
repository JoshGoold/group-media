import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [userData, setUserData] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    try {
      axios
        .get(`/api/collect-cookie`, {
          headers: {
          'Authorization': `Bearer `, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }})
        .then((res) => {
          if (res.data.valid) {
            setUser(res.data.userCookie);
          } else {
            nav("/login");
          }
        })
        .catch((err) => {
          console.error('Axios error:', err.response ? err.response.data : err.message);
        });
        
    } catch (error) {
      console.error(error.message, "Internal server error");
    }
  }, []);

  const handleUserConversations = async (username) => {
    try {
      const response = await axios.get(
        `/api/message-history?username=${username}`,
        {
          headers: {
          'Authorization': `Bearer `, // Include the token in the Authorization header
          'Content-Type': 'application/json'
        }}
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

  return (
    <UserContext.Provider value={{ user, handleUserConversations }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
