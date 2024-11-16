import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './layout';
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
                {/* 로그인과 회원가입 페이지는 상단바 없이 렌더링 */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* 상단바가 포함된 레이아웃으로 렌더링 */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Mainpage />} />
                    <Route path="/user/:userId" element={<UserPage />} />
                    <Route path="/user/:userId/edit" element={<EditPage />} />
                    <Route path="/chat/:roomId" element={<ChatPage />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/chatroom" element={<ChatRoomPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
