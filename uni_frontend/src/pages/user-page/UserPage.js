import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";

const dummy_qna = [
    {
        qnaId: 1,
        userId: 2,
        content: "이건 더미에요",
        reply: [{
            replyId: 1,
            userId: 2,
            content: "진짜요?"
        }, {
            replyId: 2,
            userId: 2,
            content: "시간 언제 괜찮으세요"
        }, {
            replyId: 3,
            userId: 1,
            content: "시간 언제 괜찮으세요"
        }]
    }, {
        qnaId: 2,
        userId: 1,
        content: "시간 언제 괜찮으세요",
        reply: []
    }, {
        qnaId: 3,
        userId: 2,
        content: "시간 언제 괜찮으세요",
        reply: []
    }, {
        qnaId: 4,
        userId: 1,
        content: "시간 언제 괜찮으세요",
        reply: []
    }
]
const UserPage = () => {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const [replyInput, setReplyInput] = useState("");
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
            <div>
                <button className="ChatRoom" onClick={handleClickChatRoom}>ChatRoom</button>
                <button className="Edit" onClick={handleClickEdit}>Edit</button>
                <button className="Chatting" onClick={handleClickChat}>Chat</button>
                <button className="Report" onClick={handleClickReport}>Report</button>
            </div>
            // (props.owner ?
            //         <div>
            //             <button className="ChatRoom" onClick={handleClickChatRoom}>채팅방</button>
            //             <button className="Edit" onClick={handleClickEdit}>Edit</button>
            //             <button className="ChatRoom">Easter</button>
            //         </div> :
            //         <div>
            //             <button className="ChatRoom" onClick={handleClickChatRoom}>채팅방</button>
            //             <button className="Chatting" onClick={handleClickChat}>Chat</button>
            //             <button className="Report" onClick={handleClickReport}>Report</button>
            //         </div>
            // )
        )
    };
    const Context = (props) => {
        return (
            <div className="Context">
                <span>{props.title}</span>
                <p className="Explain">{props.text}</p>
            </div>
        );
    }
    const QnaSection = (props) => {
        const Qna = (props) => {
            const handleClickReply = () => {
                const result = fetch(`/user/${userId}/qnas/${props.data.qnaId}/replies`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({"content": userId})
                })
                    .catch((err) => {
                        console.log(err);
                        alert('error: fetch fail - chat');
                    });
                setReplyInput(() => "");
            };
            return (
                <div className="Reply">
                    <img src={props.data.imageUrl} alt="User Icon"/>
                    <div>
                        <div className="Reply-content">{props.data.content}</div>
                        <div className="Qna-options">
                            <button onClick={handleClickReply}>Reply</button>
                        </div>
                    </div>
                </div>
            );
        };
        const Reply = (props) => {
            return (
                <div className="Reply">
                    <img src={props.data.imageUrl} alt="User Icon"/>
                    <div>
                        <div className="Reply-content">{props.data.content}</div>
                    </div>
                </div>
            );
        }

        const QnaBox = (props) => {
            return (
                props.data && props.data.map((data, i) => {
                    return <Reply data={data} key={`Reply-${data.qnaId}-${data.replyId}`}/>;
                })
            )
        }

        return (
            props.qnas.map((data, i) => {
                return (
                    <div key={`Qna-${data.qnaId}`}>
                        <Qna data={data}/>
                        <div className="Qna-box">
                            <QnaBox data={data.reply} key={`QnaBox-${data.qnaId}`}/>
                        </div>
                    </div>
                );
            })
        )
    };
    const handleChangeReplyInput = (e) => {
        setReplyInput(() => e.target.value);
    }
    const handleClickPost = () => {
        const result = fetch(`/user/${userId}/qnas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"content": userId})
        })
            .catch((err) => {
                console.log(err);
                alert('error: fetch fail - chat');
            });
        setReplyInput(() => "");
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
                            <p>User: {user.userName}</p>
                            <p>Region: {user.region}</p>
                            <p>Univ: {user.univ}</p>
                            <p>Employ count: {user.numEmployment}</p>
                            <p>Time: {user.time}</p>
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
                <div className="Qna-container">
                    <QnaSection qnas={user.qnas?user.qnas:dummy_qna}/>
                    <div className="Input-box">
                        <input type="text" value={replyInput} onChange={handleChangeReplyInput} placeholder="댓글을 써보세요"/>
                        <button onClick={handleClickPost}>Post</button>
                    </div>
                </div>
            </div>) : null
    );
}

export default UserPage;