import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 사용
import Cookies from 'js-cookie';
import './chatList.css';
import {getChatRoom} from "../../api/chatAxios";
import {getMyData} from "../../api/userAxios";

function ChatList() {
    const [chatRooms, setChatRooms] = useState([]); // 채팅 목록
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 오류 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [roomsPerPage] = useState(10); // 한 페이지에 보일 채팅방 수
    const navigate = useNavigate(); // 채팅방으로 이동을 위해 사용

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const result = await getMyData();
                const userId = result.userId;

                if (!userId) {
                    setError('로그인 정보가 없습니다.');
                    return;
                }

                const response = await getChatRoom();
                const data = await response.data;

                if (response.status === 200) {
                    // 채팅방 데이터를 최신 메시지를 기준으로 내림차순 정렬
                    const sortedChatRooms = data.sort((a, b) => {
                        const lastMessageA = a.chatMessages[a.chatMessages.length - 1];
                        const lastMessageB = b.chatMessages[b.chatMessages.length - 1];

                        if(lastMessageA && lastMessageB)
                            return new Date(lastMessageB.sendAt) - new Date(lastMessageA.sendAt);
                        // 채팅이 존재하지 않는 채팅방의 경우 원리를 몰라 일단 1 return
                        else
                            return 1;
                    });
                    setChatRooms(sortedChatRooms);
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

    // 현재 페이지에 해당하는 채팅방 데이터를 가져오기
    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = chatRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    // 페이지네이션 처리
    const totalPages = Math.ceil(chatRooms.length / roomsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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
                    {currentRooms.map((room) => (
                        <li
                            key={room.chatRoomId}
                            className="chat-item"
                            onClick={() => handleChatClick(room)}
                        >
                            <img
                                src={room.otherImgProf || '/default-profile.png'}
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        이전
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatList;
