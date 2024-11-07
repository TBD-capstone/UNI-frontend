import {dummy_l} from '../Dummy';
import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";

const UserPage = () => {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();

    const MoveButton = (props) => {

        const handleClickReport = () => {
            alert("신고");
        };
        const handleClickEdit = () => {
            navigate(`${pathname}/edit`);
        };
        const handleClickChatRoom = () => {
            navigate("/chatroom");
        };
        const handleClickChat = () => {
            const result = fetch("/api/chat/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"receiverId": userId})
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail - chat');
                })
                .then(response => response.json())
                .then((data) => {
                    navigate(`/chat/${data.chatRoomId}`, {
                        state: data
                    });
                    console.log(data);
                })
                .catch((err) => {
                    console.log(err);

                });
        }
        return (
            (props.owner ?
                    <div>
                        <button className="Easter" onClick={handleClickChatRoom}>채팅방</button>
                        <button className="Edit" onClick={handleClickEdit}>Edit</button>
                        <button className="Easter">Easter</button>
                    </div> :
                    <div>
                        <button className="Easter" onClick={handleClickChatRoom}>채팅방</button>
                        <button className="Chatting" onClick={handleClickChat}>Chat</button>
                        <button className="Report" onClick={handleClickReport}>Report</button>
                    </div>
            )
        )
    }
    const Context = (props) => {
        return (
            <div className="Context">
                <span>{props.title}</span>
                <p className="Explain">{props.text}</p>
            </div>
        );
    }
    const QnaBox = (props) => {
        return (
            <div>
                <div className="chat-container">
                    <div className="message">
                        <img src="../../../public/UNI_Logo.png" alt="User Icon"/>
                        <div>
                            <div className="message-content">질문이 있으세요?</div>
                        </div>
                    </div>

                    <div className="message user">
                        <img src="user-icon.png" alt="User Icon"/>
                        <div>
                            <div className="message-content">시간이 언제가 제일 편하세요?</div>
                            <div className="message-options">
                                <button>게시</button>
                            </div>
                        </div>
                    </div>

                    <div className="message">
                        <img src="user-icon.png" alt="User Icon"/>
                        <div>
                            <div className="message-content">매일 아침 9시부터 오후 6시까지입니다</div>
                        </div>
                    </div>

                    <div className="message user">
                        <img src="user-icon.png" alt="User Icon"/>
                        <div>
                            <div className="message-content">시간이 언제가 제일 편하세요?</div>
                            <div className="message-options">
                                <button>댓글달기</button>
                            </div>
                        </div>
                    </div>

                    <div className="reply-box">
                        <input type="text" placeholder="댓글을 써보세요"/>
                        <button>게시</button>
                    </div>
                </div>
            </div>
        )
    };
    useEffect(() => {
        (async () => {
            const result = fetch(`/api/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail');
                    setUser(dummy_l[userId]);
                })
                .then(response => response.json())
                .then((data) => {
                    setUser(() => data);
                })
                .catch((err) => {
                    console.log(err);

                });
        })();
    }, [userId, pathname]);

    return (
        user ? (
            <div>
                <div className="Image-back-container">
                    <img className="Image-back" src={user.img_back} alt="배경사진"/>
                </div>
                <div className="Button-section">
                    <MoveButton owner={false}/>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={user.img_prof} alt="프로필사진"/>
                        </div>
                        <div className="Profile-content">
                            <p>{user.star}</p>
                            <span>{user.name}</span>
                            <span className="Region">{user.region}</span>
                            <p>{user.univ}</p>
                            <p>{user.numEmployment}회 고용</p>
                            <p>{user.time}</p>
                            {user.hashtags && user.hashtags.map((hashtag, i) => {
                                return (
                                    <span>#{hashtag} </span>
                                )
                            })}
                        </div>
                    </div>
                    <Context title="지도" text={user.region}></Context>
                    <Context title="자기소개" text={user.description}></Context>
                </div>
                <QnaBox/>
            </div>) : null
    );
}

export default UserPage;