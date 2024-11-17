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
import Cookies from "js-cookie";
import MatchingStatus from './matchingList';
import ChatList from './chatList';
import Review from './review'; // Review 페이지 추가



// fetchWithLanguage 함수 정의
const fetchWithLanguage = async (url, options = {}) => {
    const selectedLanguage = Cookies.get('language') || 'en'; // 쿠키에서 언어 가져오기
    const headers = {
        ...options.headers,
        'Accept-Language': selectedLanguage,
    };
    console.log(`Request to: ${url} with Accept-Language: ${selectedLanguage}`);
    return fetch(url, { ...options, headers });
};


function App() {
    return (
        <Router>
            <Routes>
                {/* 기본 경로를 로그인 페이지로 리다이렉트 */}
                <Route
                    path="/"
                    element={Cookies.get('userName')
                        ? <Navigate to="/main" replace />
                        : <Navigate to="/login" replace />}
                />

                {/* 로그인과 회원가입 페이지는 상단바 없이 렌더링 */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* 상단바가 포함된 레이아웃으로 렌더링 */}
                <Route element={<Layout />}>
                    <Route path="/main" element={<Mainpage fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/user/:userId" element={<UserPage fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/user/:userId/edit" element={<EditPage fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/chat/:roomId" element={<ChatPage fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/admin" element={<Admin fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/chatroom" element={<ChatRoomPage fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/matching-list" element={<MatchingStatus fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/chat-list" element={<ChatList fetchWithLanguage={fetchWithLanguage} />} />
                    <Route path="/review/:matchingId" element={<Review fetchWithLanguage={fetchWithLanguage} />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
