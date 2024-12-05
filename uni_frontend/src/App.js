import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './layout';
import Mainpage from './mainpage';
import Register from './Register';
import Login from './login';
import UserPage from './pages/user-page/UserPage';
import EditPage from "./pages/edit-page/EditPage";
import ChatPage from "./pages/chat-page/ChatPage";
import Admin from "./admin";
import Cookies from "js-cookie";
import MatchingStatus from './matchingList';
import ChatList from './chatList';
import Review from './review';
import Forget from "./Forgat";
import usePushNotification from "./Alarm";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

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

// PrivateRoute 컴포넌트: 로그인 확인 후 보호된 라우트로 이동
const PrivateRoute = ({ element }) => {
    const isLoggedIn = !!Cookies.get('userName'); // 로그인 여부 확인
    return isLoggedIn ? element : <Navigate to="/login" replace />;
};

function App() {
    const notification = usePushNotification();
    const [alarm, setAlarm] = useState(true);
    const [chatRooms, setChatRooms] = useState([]); // chatRooms 상태 추가
    const userId = Cookies.get('userId');

    const changeAlarm = (b) => {
        setAlarm(() => b);
    };

    useEffect(() => {
        if (userId) {
            const socketChat = new SockJS(`${process.env.REACT_APP_API_URL}/ws/chat`);
            const stompClientInstance = Stomp.over(socketChat);

            stompClientInstance.debug = (str) => console.log(str);

            stompClientInstance.connect({}, () => {
                console.log("Connected to WebSocket");

                stompClientInstance.subscribe(`/sub/user/${userId}`, (msg) => {
                    if (alarm) {
                        const newMessage = JSON.parse(msg.body);
                        console.log("Received message:", newMessage);
                        notification.fireNotification('new message', newMessage.content);
                        // 새로운 메시지가 도착했을 때 읽지 않은 메시지 수 갱신
                        setChatRooms((prevRooms) => {
                            return prevRooms.map((room) => {
                                if (room.chatRoomId === newMessage.roomId) {
                                    return {
                                        ...room,
                                        unreadCount: room.unreadCount + 1,
                                    };
                                }
                                return room;
                            });
                        });
                    }
                });
            }, (error) => {
                console.error("WebSocket connection error:", error);
            });

            return () => {
                if (stompClientInstance) {
                    stompClientInstance.disconnect();
                    console.log("Disconnected from WebSocket: Alarm");
                }
            };
        }
    }, [userId, alarm, notification]);

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
                <Route path="/forget" element={<Forget />} />

                {/* 상단바가 포함된 레이아웃으로 렌더링 */}
                <Route element={<Layout />}>
                    <Route path="/main" element={<PrivateRoute element={<Mainpage fetchWithLanguage={fetchWithLanguage} />} />} />
                    <Route path="/user/:userId" element={<PrivateRoute element={<UserPage fetchWithLanguage={fetchWithLanguage} />} />} />
                    <Route path="/user/edit" element={<PrivateRoute element={<EditPage fetchWithLanguage={fetchWithLanguage} />} />} />
                    <Route path="/chat/:roomId" element={<PrivateRoute element={<ChatPage fetchWithLanguage={fetchWithLanguage} changeAlarm={changeAlarm} />} />} />
                    <Route path="/admin" element={<PrivateRoute element={<Admin fetchWithLanguage={fetchWithLanguage} />} />} />
                    <Route path="/matching-list" element={<PrivateRoute element={<MatchingStatus fetchWithLanguage={fetchWithLanguage} />} />} />
                    <Route path="/chat-list" element={<PrivateRoute element={<ChatList fetchWithLanguage={fetchWithLanguage} />} />} />
                    <Route path="/review/:matchingId" element={<PrivateRoute element={<Review fetchWithLanguage={fetchWithLanguage} />} />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
