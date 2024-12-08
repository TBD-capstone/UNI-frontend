import {useEffect, useRef, useState} from "react";
import "./ChatPage.css";
import {useLocation, useParams} from "react-router-dom";
import {Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {useTranslation} from "react-i18next";
import {IoIosArrowDropupCircle} from "react-icons/io";
import {MdGTranslate} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {getChatRoomMessage, postChatRoomLeave} from "../../api/chatAxios";
import {getMyData} from "../../api/userAxios";
import {getPendingMatch} from "../../api/matchAxios";
import {getChatTranslate} from "../../api/translateAxios";


const ChatPage = (props) => {
    const basicProfileImage = '/profile-image.png'
    const {t} = useTranslation();
    const {roomId} = useParams();
    const {state} = useLocation();
    const [userId, setUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [matchingId, setMatchingId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [isKorean, setIsKorean] = useState(null);
    // const isKorean = Cookies.get('isKorean') === 'true';
    // const language = Cookies.get('language');
    const [unreadMessageIds, setUnreadMessageIds] = useState([]);
    const unreadMessageIdsRef = useRef(unreadMessageIds);
    const [stompClientInstance, setStompClientInstance] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const leaveChatRoom = async () => {
        const apiURL = `${process.env.REACT_APP_API_URL}/api/chat/room/${roomId}/leave`;
        console.log("Attempting to leave chat room with roomId:", roomId);

        try {
            const response = await postChatRoomLeave({roomId});

            if (response.status === 200) {
                console.log("Successfully left the chat room.");
            } else {
                console.error("Failed to leave the chat room. Response:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error while leaving the chat room:", error);
        }
    };

    useEffect(() => {
        const handleLeave = async () => {
            console.log("Handling leave chat room...");
            await leaveChatRoom();
        };

        const handlePageHide = () => {
            console.log("Pagehide detected. Leaving chat room...");
            handleLeave();
        };

        const handleBeforeUnload = (event) => {
            console.log("Beforeunload detected. Leaving chat room...");
            handleLeave();
            event.preventDefault(); // 기본 동작 방지
            event.returnValue = ""; // 일부 브라우저에서 필요
        };

        const handlePopState = () => {
            console.log("Popstate detected. Leaving chat room...");
            handleLeave();
        };

        // 브라우저 이벤트 리스너 등록
        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            // 리스너 제거
            window.removeEventListener("pagehide", handlePageHide);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [roomId, navigate]);

    useEffect(() => {
        const handlePageHide = () => {
            console.log("Pagehide detected. Leaving chat room...");
            leaveChatRoom();
        };

        const handleBackNavigation = () => {
            leaveChatRoom().then(() => {
                navigate(-1); // 뒤로가기 실행
            });
        };

        // 브라우저 이벤트 리스너 등록
        window.addEventListener("pagehide", handlePageHide);

        return () => {
            // 리스너 제거
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [roomId, navigate]);

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
                        const data = await getChatTranslate({messageId: props.messageId});
                        setTranslatedChat(() => data);
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
                        {showTranslate && <><br/><span className="translate-text">{translatedChat}</span></>}
                    </div>
                    {!props.owner &&
                        (showTranslate ?
                            <IoIosArrowDropupCircle className={'translate-open'} onClick={handleClickDropUp}/> :
                            <MdGTranslate className={'translate-open'} onClick={handleClickTranslate}/>)
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
                JSON.stringify({requesterId: state.myId, receiverId: state.otherId})
            );
            console.log({requesterId: state.myId, receiverId: state.otherId})
        } else {
            alert(t("chatPage.match_request_error"));
        }
    };
    const handleClickAccept = () => {
        if (stompClient && matchingId) {
            stompClient.send(
                `/pub/match/respond`,
                {},
                JSON.stringify({matchingId: matchingId, accepted: true})  // requestId -> matchingId로 수정 예정
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
                JSON.stringify({roomId: roomId, content: message})
            );

            setMessage(""); // 입력 필드 초기화
        } else {
            console.warn("Attempted to send an empty message");
        }
    };

    useEffect(() => {
        const initChat = async () => {
            const meData = await getMyData();
            const isKorean = meData.role !== 'EXCHANGE'
            setIsKorean(isKorean);

            if (!state || !roomId) {
                console.error("No initial chat messages provided. Defaulting to empty array.");
                setMessages([]);
                return;
            }
            // const receiverId = isKorean ? state.otherId : state.myId;
            // const requesterId = isKorean ? state.myId : state.otherId;
            //
            // const matchingResult = await getPendingMatch({requesterId, receiverId});
            const messagesResult = await getChatRoomMessage({roomId});

            console.log("Setting initial messages:", messagesResult);
            setMessages(() => messagesResult);
        };
        initChat();

        console.log("Initializing WebSocket connection...");

        const socketChat = new SockJS(`${process.env.REACT_APP_API_URL}/ws/chat`);
        const stompClientInstance = Stomp.over(socketChat);

        props.changeAlarm(false);

        stompClientInstance.connect({Authorization: `Bearer ${localStorage.getItem('accessToken')}`}, () => {

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

            console.log("WebSocket disconnect detected. Sending leave API request...");
            leaveChatRoom();

            if (stompClientInstance) {
                stompClientInstance.disconnect(() => {
                    console.log("Disconnected from WebSocket: Chat");
                });
            }

            props.changeAlarm(true);
        };
    }, [roomId, state, props]);

    return (
        messages ? (
            <div className="chat-page">
                <div className="match-section">
                    <div className="chat-profile">
                        <img src={state.otherImgProf || basicProfileImage} alt="Profile"/>
                        <div className="Profile-name">{state.otherName}</div>
                    </div>
                    <div className="Match-button">
                        {isKorean ?
                            (matchingId ?
                                <button className="Activated-button"
                                        onClick={handleClickAccept}>{t("chatPage.accept")}</button>
                                :
                                <button className="Unactivated-button">{t("chatPage.accept")}</button>)
                            :
                            <button className="Activated-button"
                                    onClick={handleClickMatch}>{t("chatPage.match")}</button>
                        }

                    </div>
                </div>
                <ChatBox chatList={messages} userId={state.myId}/>
                <div className="input-section">
                    <div className='input-content'>
                        <input
                            className="input-box"
                            value={message}
                            onChange={handleChangeMessage}
                            onKeyDown={(e) => handleKeyDownMessage(e)}
                            placeholder={t("chatPage.input_message_placeholder")}/>
                        <button onClick={handleClickSend}>{t("chatPage.send")}</button>
                    </div>
                </div>

            </div>) : null
    );
}

export default ChatPage;