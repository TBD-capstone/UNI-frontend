import {dummy_chat} from '../Dummy';
import {useEffect, useState} from "react";
import "./ChatPage.css";
import {useLocation, useParams} from "react-router-dom";
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const ChatPage = () => {
    const { roomId } = useParams();
    const {state} = useLocation();
    const [messages, setMessages] = useState(state.chatMessages);
    const [message, setMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);

    const ChatBox = (props) => {
        const Chat = (props) => {
            return (
                <div className="Chat">
                    <span className={props.owner?"Mine":"Them"}>{props.text}</span>
                </div>
            )
        };
        return (
            (props.chatList) && (props.chatList).map((d, i) => {
                return (
                    <Chat
                        owner={d.senderId===props.userId}
                        text={d.content}
                        key={`chat-${i}`}
                    />
                )
            })
        )
    }
    const handleClickMatch = () => {
        console.log(roomId);
    }
    const handleChangeMessage = (e) => {
        setMessage((prev) => (e.target.value));
    }
    const handleKeyDownMessage = (e) => {
        if(e.key === "Enter") {
            handleClickSend();
        }
    }

    const handleClickSend = () => {
        if (stompClient && message.trim() !== '') {
            console.log("Sending message:", message);  // 발신 메시지 로그 출력
            stompClient.send(
                `/pub/message`,
                {},
                JSON.stringify({ roomId: roomId, content: message })
            );
        }

    }

    useEffect( () => {
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
        const socket = new SockJS('http://localhost:8080/ws/chat');
        const stompClientInstance = Stomp.over(socket);

        stompClientInstance.debug = (str) => console.log(str);

        stompClientInstance.connect({}, () => {
            console.log("Connected to WebSocket");

            stompClientInstance.subscribe(`/sub/chat/room/${roomId}`, (msg) => {
                console.log("Received message:", msg.body);  // 수신 메시지 로그 출력
                const newMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        }, (error) => {
            console.error("WebSocket connection error:", error);
        });

        setStompClient(stompClientInstance);

        return () => {
            if (stompClientInstance) {
                stompClientInstance.disconnect();
                console.log("Disconnected from WebSocket");
            }
        };


    }, []);

    return (
        messages?(
            <div className="Chat-page">
                <div className="Chat-room">
                    <ChatBox chatList={messages} userId={state.myId}/>
                </div>
                <div className="Input-section">
                    <button className="Match-button" onClick={handleClickMatch}>match</button>
                    <input
                        className="Input-box"
                        value={message}
                        onChange={handleChangeMessage}
                        onKeyDown={(e) => handleKeyDownMessage(e)}
                        placeholder={'메시지 입력'}/>
                    <button
                        className="Send-button"
                        onClick={handleClickSend}>send
                    </button>
                </div>
            </div>):null
    );
}

export default ChatPage;