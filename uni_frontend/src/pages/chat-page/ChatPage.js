import {dummy_chat, dummy_l} from '../Dummy';
import {useEffect, useRef, useState} from "react";
import "./ChatPage.css";
import {useLocation} from "react-router-dom";

const ChatPage = () => {
    const [chatRoom, setChatRoom] = useState(null);
    const [message, setMessage] = useState("");
    const webSocket = useRef(null);
    const {pathname} = useLocation();
    const ChatRoom = (props) => {
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
                        owner={d.id===props.userId}
                        userId={props.userId}
                        text={d.text}
                        key={`chat-${i}`}
                    />
                )
            })
        )
    }
    const handleChangeMessage = (e) => {
        setMessage((prev) => (e.target.value));
    }

    const handleClickSend = () => {
        alert(message);
        setMessage("");
    }

    useEffect( () => {
        const chat_id = Number(pathname.split('/').at(2));
        (async () => {
            const result = fetch(`http://localhost:8080/api/chat/${chat_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail');
                    setChatRoom(dummy_chat);
                })
                .then(response => response.json())
                .then((data) => {
                    setChatRoom(() => data);
                })
                .catch((err) => {
                    console.log(err);

                });
        })();
    }, [chatRoom]);

    return (
        chatRoom?(
            <div className="Chat-page">
                <div className="Chat-room">
                    <ChatRoom chatList={chatRoom} userId={"1"}/>
                </div>
                <div className="Input-section">
                    <button className="Match-button">+</button>
                    <input
                        className="Input-box"
                        value={message}
                        onChange={handleChangeMessage}
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