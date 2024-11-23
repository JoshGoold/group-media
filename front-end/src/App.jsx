import React from "react";
import {  Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Register from "./components/registry/Register.jsx";
import Login from "./components/registry/Login.jsx";
import UserProfile from "./components/UserProfile";
import { UserProvider } from "./CookieContext.jsx";
import GroupType from "./components/group-folder/GroupType.jsx";
import GroupPage from "./components/group-folder/groups/GroupPage.jsx";
import ConversationPage from './components/dashboard-user/ConversationPage.jsx'

const App = ({ Router, location }) => {
  return (
    <div className="fixed top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
      <Router location={location}>
        <UserProvider>
          <Routes>
            <Route index element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/:username" element={<Dashboard />} />
            <Route path="/user-profile/:username" element={<UserProfile />} />
            <Route path="/dashboard/:username/groups/:grouptype/:groupcategory" element={<GroupType/>}/>
            <Route path="/dashboard/:username/groups/:groupname/:groupid" element={<GroupPage/>}/>
            <Route path="/dashboard/conversation/:id/:username" element={<ConversationPage/>}/>
          </Routes>
        </UserProvider>
      </Router>
    </div>
  );
};

export default App;
