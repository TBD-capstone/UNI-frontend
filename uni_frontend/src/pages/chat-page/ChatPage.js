import {useEffect, useRef, useState} from "react";
import "./ChatPage.css";
import {useLocation, useParams} from "react-router-dom";
import {Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { IoIosArrowDropupCircle } from "react-icons/io";
import { MdGTranslate } from "react-icons/md";
import basicProfileImage from "../../profile-image.png"


const ChatPage = (props) => {
    const { t } = useTranslation();
    const {roomId} = useParams();
    const {state} = useLocation();
    const [messages, setMessages] = useState(null);
    const [message, setMessage] = useState("");
    const [matchingId, setMatchingId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const isKorean = Cookies.get('isKorean') === 'true';
    const language = Cookies.get('language');

    const ChatBox = (props) => {
        const scrollRef = useRef();
        const Chat = (props) => {
            const [showTranslate, setShowTranslate] = useState(false);
            const [translatedChat, setTranslatedChat] = useState(null);

            const handleClickTranslate = () => {
                setShowTranslate( ()=> true);
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
                setShowTranslate(()=>false);
            }

            return (
                <div className="chat">
                    <div className={props.owner ? "Mine" : "Them"}>
                        <span>{props.text}</span>
                        {showTranslate && <><br/><span className="translate-text">{translatedChat}</span></>}
                    </div>
                    {!props.owner &&
                        (showTranslate ? <IoIosArrowDropupCircle className={'translate-open'} onClick={handleClickDropUp}/>:
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
            handleClickSend();
        }
    }

    const handleClickSend = () => {
        if (stompClient && message.trim() !== '') {
            console.log("Sending message:", message);  // 발신 메시지 로그 출력
            stompClient.send(
                `/pub/message`,
                {},
                JSON.stringify({roomId: roomId, content: message})
            );
            setMessage(() => "");
        }
    }

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
        if(!state) {
            return;
        }
        setMessages(() => state.chatMessages)
        props.changeAlarm(false);
        const socketChat = new SockJS('http://localhost:8080/ws/chat');
        const stompClientInstance = Stomp.over(socketChat);

        stompClientInstance.debug = (str) => console.log(str);

        stompClientInstance.connect({}, () => {
            console.log("Connected to WebSocket");

            stompClientInstance.subscribe(`/sub/chat/room/${roomId}`, (msg) => {
                console.log("Received message:", msg.body);
                const newMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
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
            if (stompClientInstance) {
                stompClientInstance.disconnect();
                console.log("Disconnected from WebSocket: Chat");
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
                        {isKorean?
                            (matchingId ?
                                <button className="Activated-button" onClick={handleClickAccept}>{t("chatPage.accept")}</button>
                                :
                                <button className="Unactivated-button">{t("chatPage.accept")}</button>)
                            :
                            <button className="Activated-button" onClick={handleClickMatch}>{t("chatPage.match")}</button>
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