import {useEffect, useState} from "react";
import "./ChatPage.css";
import {useLocation, useParams} from "react-router-dom";
import {Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const ChatPage = () => {
    const {roomId} = useParams();
    const {state} = useLocation();
    const [messages, setMessages] = useState(state ? state.chatMessages : null);
    const [message, setMessage] = useState("");
    const [requestId, setRequestId] = useState(null);
    const [stompClient, setStompClient] = useState(null)

    const ChatBox = (props) => {
        const Chat = (props) => {
            return (
                <div className="Chat">
                    <span className={props.owner ? "Mine" : "Them"}>{props.text}</span>
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
                    />
                )
            })
        )
    }
    const handleClickMatch = () => {
        if (stompClient && !requestId) {
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
        if (stompClient && requestId) {
            stompClient.send(
                `/pub/match/respond`,
                {},
                JSON.stringify({requestId: requestId, accepted: true})
            );
            alert("Matching is accepted.");
            setRequestId(() => null);
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
                setRequestId(() => newMessage.requestId)
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
                        {requestId ? <>
                                <button className="Activated-button" onClick={handleClickAccept}>Accept</button>
                                <button className="Unactivated-button" >Match</button>
                            </>
                            : <>
                                <button className="Unactivated-button">Accept</button>
                                <button className="Activated-button" onClick={handleClickMatch}>Match</button>
                            </>}
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