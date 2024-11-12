import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Mainpage from './mainpage';
import Register from './Register';
import Login from './login';
import UserPage from './pages/user-page/UserPage';
import EditPage from "./pages/edit-page/EditPage";
import ChatPage from "./pages/chat-page/ChatPage";
import Admin from "./admin";
import ChatRoomPage from "./pages/chatroom-page/ChatRoomPage";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Mainpage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/user/:userId" element={<UserPage/>} />
                <Route path="/user/:userId/edit" element={<EditPage/>} />
                <Route path="/chat/:roomId" element={<ChatPage/>} />
                <Route path="/admin" element={<Admin/>} />
                <Route path="/chatroom" element={<ChatRoomPage/>} />
            </Routes>
        </Router>
    );
}

export default App;
