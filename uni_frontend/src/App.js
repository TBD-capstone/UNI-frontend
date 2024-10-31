import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Mainpage from './mainpage';
import Register from './Register';
import UserPage from './pages/user-page/UserPage';
import EditPage from "./pages/edit-page/EditPage";
import ChatPage from "./pages/chat-page/ChatPage";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Mainpage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user" element={<UserPage/>} />
                <Route path="/user/:id" element={<UserPage/>} />
                <Route path="/user/:id/edit" element={<EditPage/>} />
                <Route path="/chat/:id" element={<ChatPage/>} />
            </Routes>
        </Router>
    );
}

export default App;
