import {useEffect, useState} from "react";
import "./ChatPage.css";
import {useLocation, useParams} from "react-router-dom";
import {Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from "js-cookie";


const ChatPage = () => {
    const {roomId} = useParams();
    const {state} = useLocation();
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
                setShowTranslate(prev => !prev);
                if (!translatedChat) {
                    (async () => {
                        fetch(`/api/chat/translate/${props.messageId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept-Language': 'en'
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

            return (
                <div className="Chat">
                    <div className={props.owner ? "Mine" : "Them"}>
                        <span>{props.text}</span>
                        {showTranslate && <><br/><span>{translatedChat}</span></>}
                    </div>
                    <button className={props.owner ? "Right" : "Left"} onClick={handleClickTranslate}>&#127760;</button>
                </div>
            )
        };
        return (
            (props.chatList) && (props.chatList).map((d, i) => {
                return (
                    <Chat
                        owner={d.senderId === props.userId}
                        text={d.content}
                        key={`chat-${i}`}
                        messageId={d.messageId} // messageId를 전달 못받는다...?!
                    />
                )
            })
        )
    }
    const handleClickMatch = () => {
        if (stompClient && !matchingId) {
            stompClient.send(
                `/pub/match/request`,
                {},
                JSON.stringify({requesterId: state.myId, receiverId: state.otherId})
            );
            console.log({requesterId: state.myId, receiverId: state.otherId})
        } else {
            alert("매칭을 수락해주세요.");
        }
    };
    const handleClickAccept = () => {
        if (stompClient && matchingId) {
            stompClient.send(
                `/pub/match/respond`,
                {},
                JSON.stringify({matchingId: matchingId, accepted: true})  // requestId -> matchingId로 수정 예정
            );
            alert("Matching is accepted.");
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
        console.log(isKorean);

        return () => {
            if (stompClientInstance) {
                stompClientInstance.disconnect();
                console.log("Disconnected from WebSocket: Chat");
            }
        };


    }, [roomId, state]);

    return (
        messages ? (
            <div className="Chat-page">
                <div className="Match-section">
                    <div className="logo"/>
                    <div className="Profile">
                        <img src="/UNI_Logo.png" alt="Profile"/>
                        <div className="Profile-name">김현수</div>
                    </div>
                    <div className="Match-button">
                        {isKorean?
                            (matchingId ?
                                <button className="Activated-button" onClick={handleClickAccept}>Accept</button>
                                :
                                <button className="Unactivated-button">Accept</button>)
                            :
                                <button className="Activated-button" onClick={handleClickMatch}>Match</button>
                        }

                    </div>
                </div>
                <div className="Chat-section">
                    <ChatBox chatList={messages} userId={state.myId}/>
                </div>
                <div className="Input-section">
                    <input
                        className="Input-box"
                        value={message}
                        onChange={handleChangeMessage}
                        onKeyDown={(e) => handleKeyDownMessage(e)}
                        placeholder={'Input message'}/>
                    <button onClick={handleClickSend}>send</button>
                </div>

            </div>) : null
    );
}

export default ChatPage;