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
                    // 로그인한 유저와 다른 상대방만 표시
                    const filteredRooms = data.filter(
                        (room) => room.otherId !== parseInt(userId)
                    );
                    setChatRooms(filteredRooms);
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

    // 채팅방 클릭 시 실행
    const handleChatClick = (room) => {
        const myId = Cookies.get('userId'); // 현재 로그인한 유저 ID
        const chatRoomId = room.chatRoomId;
        const otherId = room.otherId;
        const chatMessages = room.chatMessages;

        if (!myId || !chatRoomId || !otherId || !chatMessages) {
            console.error('필수 데이터가 누락되었습니다.');
            console.log('myId:', myId, 'chatRoomId:', chatRoomId, 'otherId:', otherId , 'chatMessages:', chatMessages);
            alert('채팅방 정보를 불러오는 데 실패했습니다.');
            return;
        }

        // 디버깅용 로그 추가
        console.log('Navigating to ChatPage with:', {
            myId,
            chatRoomId,
            otherId,
            chatMessages
        });

        navigate(`/chat/${chatRoomId}`, {
            state: room
        });
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
                            onClick={() => handleChatClick(room)} // 채팅방 클릭 시 실행
                        >
                            <p>상대방 ID: {room.otherId}</p>
                            <p>
                                마지막 메시지: {room.chatMessages.length > 0
                                ? room.chatMessages[room.chatMessages.length - 1].content
                                : '메시지가 없습니다.'}
                            </p>
                            <p>
                                보낸 시간: {room.chatMessages.length > 0
                                ? new Date(room.chatMessages[room.chatMessages.length - 1].sendAt).toLocaleString()
                                : '-'}
                            </p>
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
