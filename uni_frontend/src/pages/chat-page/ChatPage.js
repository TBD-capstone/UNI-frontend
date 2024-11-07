import {useEffect, useState} from "react";
import "./ChatPage.css";
import {useLocation, useParams} from "react-router-dom";
import {Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const ChatPage = () => {
    const {roomId} = useParams();
    const {state} = useLocation();
    const [messages, setMessages] = useState(state.chatMessages);
    const [message, setMessage] = useState("");
    const [request, setRequest] = useState(false);
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
        if (stompClient) {
            if (request) {
                stompClient.send(
                    `/pub/match/respond`,
                    {},
                    JSON.stringify({receiverId: state.myId, accepted: true})
                );
            }
            else {
                stompClient.send(
                    `/pub/match/request`,
                    {},
                    JSON.stringify({requestId: state.myId, receiverId: state.otherId})
                );
                console.log({requestId: state.myId, receiverId: state.otherId})
            }
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
                console.log("Received message:", msg.body);  // 수신 메시지 로그 출력
                const newMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
            stompClientInstance.subscribe(`/sub/match-request/${state.myId}`, (msg) => {
                console.log("Received message:", msg.body);  // 수신 메시지 로그 출력
                setRequest(() => true);
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


    }, []);

    return (
        messages ? (
            <div className="Chat-page">
                <div className="">
                    <img src="https://via.placeholder.com/250" alt="프로필 사진"/>
                    <div className="info">
                        <div className="name">김현수</div>
                        <div className="rating">
                            <span>⭐⭐⭐⭐⭐</span>
                            <span className="score">4.9</span>
                        </div>
                        <div className="details">
                            서울시 강남구<br/>
                            서울 교육대학교 3학년<br/>
                            성사된 매칭횟수: 20<br/>
                            연락 가능한 시간: 09시 ~ 18시
                        </div>
                    </div>
                    <div className="map">
                        <img src="https://via.placeholder.com/250x150" alt="활동영역 지도"/>
                    </div>
                    {request && (<button className="apply-button">매칭 신청</button>)}
                </div>
                <div className="Chat-section">
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
                </div>

            </div>) : null
    );
}

export default ChatPage;