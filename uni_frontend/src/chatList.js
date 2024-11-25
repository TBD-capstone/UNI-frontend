import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 사용
import Cookies from 'js-cookie';
import './chatList.css';

function ChatList() {
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // 채팅방으로 이동을 위해 사용

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const userId = Cookies.get('userId'); // 로그인된 유저 ID 가져오기

                if (!userId) {
                    setError('로그인 정보가 없습니다.');
                    return;
                }

                const response = await fetch(`/api/chat/rooms`);
                const data = await response.json();

                if (response.ok) {
                    setChatRooms(data);
                } else {
                    setError(data.message || '채팅 목록을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError('채팅 목록을 불러오는 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        return isToday
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString();
    };

    const handleChatClick = (room) => {
        navigate(`/chat/${room.chatRoomId}`, { state: room });
    };

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error}</div>;
    }

    return (
        <div className="chat-list-page">
            <h1>채팅 목록</h1>
            {chatRooms.length > 0 ? (
                <ul className="chat-list">
                    {chatRooms.map((room) => (
                        <li
                            key={room.chatRoomId}
                            className="chat-item"
                            onClick={() => handleChatClick(room)}
                        >
                            <img
                                src={room.profilePicture || '/default-profile.png'}
                                alt="프로필"
                                className="profile-pic"
                            />
                            <div className="chat-content">
                                <p className="chat-name">{room.otherName || '알 수 없는 사용자'}</p>
                                <p className="last-message">
                                    {room.chatMessages.length > 0
                                        ? room.chatMessages[room.chatMessages.length - 1].content
                                        : '메시지가 없습니다.'}
                                </p>
                            </div>
                            <div className="chat-right">
                                <p className="chat-date">
                                    {room.chatMessages.length > 0
                                        ? formatDate(room.chatMessages[room.chatMessages.length - 1].sendAt)
                                        : '-'}
                                </p>
                                {room.unreadCount > 0 && (
                                    <span className="unread-count">{room.unreadCount}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>현재 채팅방이 없습니다.</p>
            )}
        </div>
    );
}

export default ChatList;
