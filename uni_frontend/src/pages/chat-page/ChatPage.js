import { useEffect, useRef, useState } from "react";
import "./ChatPage.css";
import { useLocation, useParams } from "react-router-dom";
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { IoIosArrowDropupCircle } from "react-icons/io";
import { MdGTranslate } from "react-icons/md";
import { useNavigate } from "react-router-dom";


const ChatPage = (props) => {
    const basicProfileImage = '/profile-image.png'
    const { t } = useTranslation();
    const { roomId } = useParams();
    const { state } = useLocation();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [matchingId, setMatchingId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const isKorean = Cookies.get('isKorean') === 'true';
    const language = Cookies.get('language');
    const [unreadMessageIds, setUnreadMessageIds] = useState([]);
    const unreadMessageIdsRef = useRef(unreadMessageIds);
    const [stompClientInstance, setStompClientInstance] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // 상태가 변경될 때마다 ref에 최신 값 저장
        unreadMessageIdsRef.current = unreadMessageIds;
    }, [unreadMessageIds]);

    useEffect(() => {
        console.log("Unread message IDs on update:", unreadMessageIds);

        return () => {
            console.log("Cleanup triggered with unreadMessageIds:", unreadMessageIdsRef.current);
        };
    }, [unreadMessageIds]);

    const handleNewMessage = (newMessage) => {
        setMessages((prevMessages) => {
            const exists = prevMessages.some((msg) => msg.messageId === newMessage.messageId);
            if (exists) return prevMessages; // 중복 메시지 무시
            return [...prevMessages, newMessage];
        });
    };

    const ChatBox = (props) => {
        const scrollRef = useRef();
        const Chat = (props) => {
            const [showTranslate, setShowTranslate] = useState(false);
            const [translatedChat, setTranslatedChat] = useState(null);

            const handleClickTranslate = () => {
                setShowTranslate(() => true);
                if (!translatedChat) {
                    (async () => {
                        fetch(`/api/chat/translate/${props.messageId}`, {
                            method: 'GET',
                            headers: language ?
                                {
                                    'Content-Type': 'application/json',
                                    'Accept-language': language
                                } :
                                {
                                    'Content-Type': 'application/json'

                                }
                        })
                            .catch((err) => {
                                console.log(err);
                                alert('error: fetch fail');
                            })
                            .then((response) => response.text())
                            .then((data) => {
                                console.log(data);
                                setTranslatedChat(() => data);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    })();
                }
            }
            const handleClickDropUp = () => {
                setShowTranslate(() => false);
            }

            return (
                <div className="chat">
                    <div className={props.owner ? "Mine" : "Them"}>
                        <span>{props.text}</span>
                        {showTranslate && <><br /><span className="translate-text">{translatedChat}</span></>}
                    </div>
                    {!props.owner &&
                        (showTranslate ? <IoIosArrowDropupCircle className={'translate-open'} onClick={handleClickDropUp} /> :
                            <MdGTranslate className={'translate-open'} onClick={handleClickTranslate} />)
                    }
                </div>
            )
        };
        useEffect(() => {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, [props.chatList]);
        return (
            <div className="chat-section" ref={scrollRef}>
                {(props.chatList) && (props.chatList).map((d, i) => {
                    return (
                        <Chat
                            owner={d.senderId === props.userId}
                            text={d.content}
                            key={`chat-${i}`}
                            messageId={d.messageId} // messageId를 전달 못받는다...?!
                        />
                    )
                })}
            </div>
        );
    };
    const handleClickMatch = () => {
        if (stompClient && !matchingId) {
            stompClient.send(
                `/pub/match/request`,
                {},
                JSON.stringify({ requesterId: state.myId, receiverId: state.otherId })
            );
            console.log({ requesterId: state.myId, receiverId: state.otherId })
        } else {
            alert(t("chatPage.match_request_error"));
        }
    };
    const handleClickAccept = () => {
        if (stompClient && matchingId) {
            stompClient.send(
                `/pub/match/respond`,
                {},
                JSON.stringify({ matchingId: matchingId, accepted: true })  // requestId -> matchingId로 수정 예정
            );
            alert(t("chatPage.match_accepted"));
            setMatchingId(() => null);
        }
    }
    const handleChangeMessage = (e) => {
        setMessage((prev) => (e.target.value));
    }

    const handleKeyDownMessage = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // 기본 동작 방지
            handleClickSend(); // 메시지 전송
        }
    };

    const handleClickSend = () => {
        if (stompClient && message.trim() !== '') {
            console.log("Sending message:", message);

            // 메시지 전송
            stompClient.send(
                `/pub/message`,
                {},
                JSON.stringify({ roomId: roomId, content: message })
            );

            setMessage(""); // 입력 필드 초기화
        } else {
            console.warn("Attempted to send an empty message");
        }
    };

    useEffect(() => {
        console.log("Unread message IDs on update:", unreadMessageIds);

        return () => {
            console.log("Unread message IDs on cleanup:", unreadMessageIds);
        };
    }, [unreadMessageIds]);

    useEffect(() => {
        console.log("WebSocket connection status:", stompClient?.connected);

        return () => {
            console.log("WebSocket connection status on cleanup:", stompClient?.connected);
        };
    }, [stompClient]);

    useEffect(() => {
        console.log("Unread message IDs updated:", unreadMessageIds);
        console.log("Unread message IDs reference:", unreadMessageIdsRef.current);

        return () => {
            console.log("Cleanup triggered with unreadMessageIds:", unreadMessageIdsRef.current);
        };
    }, [unreadMessageIds]);

    useEffect(() => {
        // 읽지 않은 메시지 ID 상태 업데이트
        unreadMessageIdsRef.current = unreadMessageIds;

        const sendBulkReadRequest = () => {
            const unreadMessagesCopy = [...unreadMessageIdsRef.current];

            if (unreadMessagesCopy.length > 0) {
                const payload = JSON.stringify({
                    roomId: roomId,
                    messageIds: unreadMessagesCopy,
                });

                // RESTful API 호출
                if (navigator.sendBeacon) {
                    try {
                        navigator.sendBeacon(
                            `${process.env.REACT_APP_API_URL}/read/bulk`,
                            new Blob([payload], { type: "application/json" })
                        );
                        console.log("Successfully sent bulk read status using sendBeacon:", unreadMessagesCopy);
                    } catch (error) {
                        console.error("Error sending bulk read status using sendBeacon:", error);
                    }
                } else {
                    fetch(`${process.env.REACT_APP_API_URL}/read/bulk`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: payload,
                    }).then((response) => {
                        if (response.ok) {
                            console.log("Successfully sent bulk read status using fetch.");
                        } else {
                            console.error("Failed to mark messages as read using fetch.");
                        }
                    }).catch((error) => {
                        console.error("Error sending bulk read status using fetch:", error);
                    });
                }
            } else {
                console.log("No unread messages to mark as read.");
            }
        };

        const handlePageHide = () => {
            console.log("Pagehide detected. Processing bulk read request...");
            sendBulkReadRequest();
        };

        // 브라우저 이벤트 리스너 등록
        window.addEventListener("pagehide", handlePageHide);

        return () => {
            // 리스너 제거
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [roomId, unreadMessageIds]);

    useEffect(() => {
        const handlePageHide = (event) => {
            console.log("Pagehide detected. Processing cleanup...");

            const unreadMessagesCopy = [...unreadMessageIdsRef.current];
            if (unreadMessagesCopy.length > 0) {
                const payload = JSON.stringify({
                    roomId: roomId,
                    messageIds: unreadMessagesCopy,
                });

                if (navigator.sendBeacon) {
                    try {
                        navigator.sendBeacon(
                            `${process.env.REACT_APP_API_URL}/read/bulk`,
                            new Blob([payload], { type: 'application/json' })
                        );
                        console.log("Successfully sent bulk read status using sendBeacon.");
                    } catch (error) {
                        console.error("Error sending bulk read status using sendBeacon:", error);
                    }
                } else {
                    fetch(`${process.env.REACT_APP_API_URL}/read/bulk`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: payload,
                    }).then((response) => {
                        if (response.ok) {
                            console.log("Successfully sent bulk read status using fetch.");
                        } else {
                            console.error("Failed to mark messages as read using fetch.");
                        }
                    }).catch((error) => {
                        console.error("Error sending bulk read status using fetch:", error);
                    });
                }
            }

            if (stompClientInstance) {
                stompClientInstance.disconnect(() => {
                    console.log("Disconnected from WebSocket: Chat");
                });
            }

            props.changeAlarm(true);
        };

        window.addEventListener("pagehide", handlePageHide);

        return () => {
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [roomId, unreadMessageIdsRef, stompClientInstance]);

    useEffect(() => {
        // (async () => {
        //     const result = fetch(`/api/chat/room/${roomId}`, {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     })
        //         .catch((err) => {
        //             console.log(err);
        //             alert('error: fetch fail');
        //             setMessages(dummy_chat);
        //         })
        //         .then(response => response.json())
        //         .then((data) => {
        //             setMessages(() => data);
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //
        //         });
        // })();
        if (!state || !state.chatMessages) {
            console.error("No initial chat messages provided. Defaulting to empty array.");
            setMessages([]);
            return;
        }

        console.log("Setting initial messages:", state.chatMessages);
        setMessages(() => state.chatMessages)

        console.log("Initializing WebSocket connection...");

        const socketChat = new SockJS(`${process.env.REACT_APP_API_URL}/ws/chat`);
        const stompClientInstance = Stomp.over(socketChat);

        props.changeAlarm(false);

        stompClientInstance.connect({}, () => {

            // 메시지 읽음 처리 WebSocket 메시지 전송
            stompClientInstance.send("/pub/enter", {}, roomId);

            // 메시지 수신
            stompClientInstance.subscribe(`/sub/chat/room/${roomId}`, (msg) => {
                const newMessage = JSON.parse(msg.body);

                if (!newMessage || !newMessage.messageId || !newMessage.content) {
                    return;
                }

                handleNewMessage(newMessage);
            });

            stompClientInstance.subscribe(`/sub/match-request/${state.myId}`, (msg) => {
                console.log("Received message:", msg.body);
                const newMessage = JSON.parse(msg.body);
                if (newMessage.requesterId === state.otherId)
                    setMatchingId(() => newMessage.matchingId);   //requestId -> matchingId로 수정 예정
            });

            stompClientInstance.subscribe(`/sub/match-response/${state.myId}`, (msg) => {
                console.log("Received message:", msg.body);
                alert("Matching is accepted.");
            });

        }, (error) => {
            console.error("WebSocket connection error:", error);
        });

        setStompClient(stompClientInstance);

        return () => {
            const unreadMessagesCopy = [...unreadMessageIdsRef.current]; // 최신 상태 복사

            if (unreadMessagesCopy.length > 0) {
                console.log("Unread messages to mark as read:", unreadMessagesCopy);

                const payload = JSON.stringify({
                    roomId: roomId,
                    messageIds: unreadMessagesCopy,
                });

                if (navigator.sendBeacon) {
                    try {
                        navigator.sendBeacon(
                            `${process.env.REACT_APP_API_URL}/read/bulk`,
                            new Blob([payload], { type: 'application/json' })
                        );
                        console.log("Successfully sent bulk read status using sendBeacon.");
                    } catch (error) {
                        console.error("Error sending bulk read status using sendBeacon:", error);
                    }
                } else {
                    fetch(`${process.env.REACT_APP_API_URL}/read/bulk`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: payload,
                    }).then((response) => {
                        if (response.ok) {
                            console.log("Successfully sent bulk read status using fetch.");
                        } else {
                            console.error("Failed to mark messages as read using fetch.");
                        }
                    }).catch((error) => {
                        console.error("Error sending bulk read status using fetch:", error);
                    });
                }
            } else {
                console.log("No unread messages to mark as read.");
            }

            if (stompClientInstance) {
                stompClientInstance.disconnect(() => {
                    console.log("Disconnected from WebSocket: Chat");
                });
            }

            props.changeAlarm(true);
        };
    }, [roomId, state, props, unreadMessageIds]);

    return (
        messages ? (
            <div className="chat-page">
                <div className="match-section">
                    <div className="chat-profile">
                        <img src={state.otherImgProf || basicProfileImage} alt="Profile" />
                        <div className="Profile-name">{state.otherName}</div>
                    </div>
                    <div className="Match-button">
                        {isKorean ?
                            (matchingId ?
                                <button className="Activated-button" onClick={handleClickAccept}>{t("chatPage.accept")}</button>
                                :
                                <button className="Unactivated-button">{t("chatPage.accept")}</button>)
                            :
                            <button className="Activated-button" onClick={handleClickMatch}>{t("chatPage.match")}</button>
                        }

                    </div>
                </div>
                <ChatBox chatList={messages} userId={state.myId} />
                <div className="input-section">
                    <div className='input-content'>
                        <input
                            className="input-box"
                            value={message}
                            onChange={handleChangeMessage}
                            onKeyDown={(e) => handleKeyDownMessage(e)}
                            placeholder={t("chatPage.input_message_placeholder")} />
                        <button onClick={handleClickSend}>{t("chatPage.send")}</button>
                    </div>
                </div>

            </div>) : null
    );
}

export default ChatPage;