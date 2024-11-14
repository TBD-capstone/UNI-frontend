import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const ChatRoomPage = () => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const ChatRoom = (props) => {
        const handleClickBox = () => {
            navigate(`/chat/${props.data.chatRoomId}`, {state: props.data});
        };
        return (
            <div onClick={handleClickBox} >
                <p>채팅방 ID: {props.data.chatRoomId}</p>
                <p>상대방 ID: {props.data.otherId}</p>
            </div>
        )
    }
    useEffect(() => {
        const result = fetch("/api/chat/rooms", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail - chat');
            })
            .then(response => response.json())
            .then((data) => {
                setData(data);
                console.log(data);
            })
            .catch((err) => {
                console.log(err);

            });
    }, []);
    return (
        data && data.map((data, i) => {return(
            <ChatRoom data={data} key={`chatroom-${i}`}></ChatRoom>)

        })
    )
};
export default ChatRoomPage;