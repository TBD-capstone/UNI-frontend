import { useEffect, useState } from "react";
import "./ChatPage.css";
import { useLocation, useParams } from "react-router-dom";
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next"; // i18n 추가

const ChatPage = () => {
    const { t } = useTranslation(); // i18n 훅 사용
    const { roomId } = useParams();
    const { state } = useLocation();
    const [messages, setMessages] = useState(state ? state.chatMessages : null);
    const [message, setMessage] = useState("");
    const [matchingId, setMatchingId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const isKorean = Cookies.get('isKorean') === 'true';

    const ChatBox = (props) => {
        const Chat = (props) => {
            const [showTranslate, setShowTranslate] = useState(false);
            const [translatedChat, setTranslatedChat] = useState(null);

            const handleClickTranslate = () => {
                setShowTranslate((prev) => !prev);
                if (!translatedChat) {
                    (async () => {
                        fetch(`/api/chat/translate/${props.messageId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept-Language': 'en',
                            },
                        })
                            .then((response) => response.text())
                            .then((data) => {
                                setTranslatedChat(() => data);
                            })
                            .catch((err) => {
                                console.error(err);
                                alert(t('chat.translation_error'));
                            });
                    })();
                }
            };

            return (
                <div className="Chat">
                    <div className={props.owner ? "Mine" : "Them"}>
                        <span>{props.text}</span>
                        {showTranslate && <><br /><span>{translatedChat}</span></>}
                    </div>
                    <button className={props.owner ? "Right" : "Left"} onClick={handleClickTranslate}>
                        {t('chat.translate_button')}
                    </button>
                </div>
            );
        };

        return (
            props.chatList &&
            props.chatList.map((d, i) => (
                <Chat
                    owner={d.senderId === props.userId}
                    text={d.content}
                    key={`chat-${i}`}
                    messageId={d.messageId}
                />
            ))
        );
    };

    const handleClickMatch = () => {
        if (stompClient && !matchingId) {
            stompClient.send(
                `/pub/match/request`,
                {},
                JSON.stringify({ requesterId: state.myId, receiverId: state.otherId })
            );
        } else {
            alert(t('chat.accept_prompt'));
        }
    };

    const handleClickAccept = () => {
        if (stompClient && matchingId) {
            stompClient.send(
                `/pub/match/respond`,
                {},
                JSON.stringify({ matchingId, accepted: true })
            );
            alert(t('chat.matching_accepted'));
            setMatchingId(() => null);
        }
    };

    const handleChangeMessage = (e) => {
        setMessage(e.target.value);
    };

    const handleKeyDownMessage = (e) => {
        if (e.key === "Enter") {
            handleClickSend();
        }
    };

    const handleClickSend = () => {
        if (stompClient && message.trim() !== '') {
            stompClient.send(
                `/pub/message`,
                {},
                JSON.stringify({ roomId, content: message })
            );
            setMessage("");
        }
    };

    useEffect(() => {
        const socketChat = new SockJS('http://localhost:8080/ws/chat');
        const stompClientInstance = Stomp.over(socketChat);

        stompClientInstance.connect({}, () => {
            stompClientInstance.subscribe(`/sub/chat/room/${roomId}`, (msg) => {
                const newMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
            stompClientInstance.subscribe(`/sub/match-request/${state.myId}`, (msg) => {
                const newMessage = JSON.parse(msg.body);
                if (newMessage.requesterId === state.otherId) {
                    setMatchingId(() => newMessage.matchingId);
                }
            });
        });

        setStompClient(stompClientInstance);

        return () => {
            if (stompClientInstance) {
                stompClientInstance.disconnect();
            }
        };
    }, [roomId, state]);

    return messages ? (
        <div className="Chat-page">
            <div className="Match-section">
                <div className="logo" />
                <div className="Profile">
                    <img src="/UNI_Logo.png" alt="Profile" />
                    <div className="Profile-name">{t('chat.profile_name')}</div>
                </div>
                <div className="Match-button">
                    {isKorean ? (
                        matchingId ? (
                            <button className="Activated-button" onClick={handleClickAccept}>
                                {t('chat.accept_button')}
                            </button>
                        ) : (
                            <button className="Unactivated-button">
                                {t('chat.accept_button')}
                            </button>
                        )
                    ) : (
                        <button className="Activated-button" onClick={handleClickMatch}>
                            {t('chat.match_button')}
                        </button>
                    )}
                </div>
            </div>
            <div className="Chat-section">
                <ChatBox chatList={messages} userId={state.myId} />
            </div>
            <div className="Input-section">
                <input
                    className="Input-box"
                    value={message}
                    onChange={handleChangeMessage}
                    onKeyDown={handleKeyDownMessage}
                    placeholder={t('chat.input_placeholder')}
                />
                <button onClick={handleClickSend}>{t('chat.send_button')}</button>
            </div>
        </div>
    ) : null;
};

export default ChatPage;
