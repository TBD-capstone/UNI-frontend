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
        }
        else{
            alert("매칭을 수락해주세요");
        }
    };
    const handleClickAccept = () => {
        if (stompClient && requestId) {
            stompClient.send(
                `/pub/match/respond`,
                {},
                JSON.stringify({requestId: requestId, accepted: true})
            );
            console.log({requestId: requestId, accepted: true})
            setRequestId(()=>null);
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
                alert(msg.body);
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
                    {requestId && (<button className="apply-button" onClick={handleClickAccept}>매칭 수락</button>)}
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