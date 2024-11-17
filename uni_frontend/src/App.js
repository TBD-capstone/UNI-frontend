import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './layout';
import Mainpage from './mainpage';
import Register from './Register';
import Login from './login';
import UserPage from './pages/user-page/UserPage';
import EditPage from "./pages/edit-page/EditPage";
import ChatPage from "./pages/chat-page/ChatPage";
import Admin from "./admin";
import ChatRoomPage from "./pages/chatroom-page/ChatRoomPage";
import MatchingStatus from './matchingList';
import ChatList from './chatList';
import Review from './review'; // Review 페이지 추가

function App() {
    return (
        <Router>
            <Routes>
                {/* 기본 경로를 로그인 페이지로 리다이렉트 */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* 로그인과 회원가입 페이지는 상단바 없이 렌더링 */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* 상단바가 포함된 레이아웃으로 렌더링 */}
                <Route element={<Layout />}>
                    <Route path="/main" element={<Mainpage />} />
                    <Route path="/user/:userId" element={<UserPage />} />
                    <Route path="/user/:userId/edit" element={<EditPage />} />
                    <Route path="/chat/:roomId" element={<ChatPage />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/chatroom" element={<ChatRoomPage />} />
                    <Route path="/matching-list" element={<MatchingStatus />} />
                    <Route path="/chat-list" element={<ChatList />} />
                    <Route path="/review/:matchingId" element={<Review />} /> {/* 후기 작성 경로 추가 */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
