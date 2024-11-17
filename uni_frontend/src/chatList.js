import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './chatList.css';

function ChatList() {
    const [chatRooms, setChatRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        <li key={room.chatRoomId} className="chat-item">
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
