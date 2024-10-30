import {dummy_chat} from '../Dummy';
import {useEffect, useState} from "react";
import "./ChatPage.css";

const BottomInput = () => {
    const [message, setMessage] = useState("");
    const handleChangeMessage = (e) => {
        setMessage((prev) => (e.target.value));
    }

    const handleClickSend = () => {
        alert(message);
        setMessage("");
    }

    return (
        <div className="Bottom">
            <button>+</button>
            <input
                value={message}
                onChange={handleChangeMessage}
                placeholder={'메시지 입력'}/>
            <button onClick={handleClickSend}>send</button>
        </div>
    );
}

const ChatPage = () => {
    const [chatRoom, setChatRoom] = useState(null);
    const ChatRoom = (props) => {
        let login_user_id = 1
        const Chat = (props) => {
            return (
                <div>
                    <span>{props.text}</span>
                </div>
            )
        };
        return (
            (props.chatList) && (props.chatList).map((d, i) => {
                return (
                    <Chat
                        own={d.id===login_user_id}
                        text={d.text}
                        key={`chat-${i}`}
                    />
                )
            })
        )
    }

    const handleClickTest = () => {
        console.log(chatRoom);
    }

    useEffect(() => {
        (async () => {
            setChatRoom(dummy_chat);
        })();
    }, [chatRoom]);

    return (
        chatRoom?(
            <div>
                <button onClick={handleClickTest}>test</button>
                <ChatRoom chatList={chatRoom} />
                <BottomInput />
            </div>):null
    );
}

export default ChatPage;