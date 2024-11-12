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
    const SelfPR = (props) => {
        return (
            <div className="SelfPR">
                <span>{props.title}</span>
                <p className="Explain">{props.text}</p>
            </div>
        );
    }
    const InputBox = (props) => {
        const [content, setContent] = useState("");

        const handleChangeContent = (e) => {
            setContent(() => e.target.value);
        }
        const handleClickPost = () => {
            const result = fetch(`${props.url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"content": content})
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail - chat');
                });
            setContent(() => "");
        };
        return (
            <div className="Input-box">
                <input type="text" value={content} onChange={handleChangeContent} placeholder="댓글을 써보세요"/>
                <button onClick={handleClickPost}>Post</button>
            </div>
        )
    }
    const QnaSection = (props) => {
        const Qna = (props) => {
            return (
                <div className="Reply">
                    <img src={props.data.imageUrl} alt="User Icon"/>
                    <div>
                        <div className="Reply-content">{props.data.content}</div>
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
        const ReplyInput = (props) => {
            const [replyShow, setReplyShow] = useState(false);
            const handleClickReply = () => {
                setReplyShow((p)=>!p);
            }
            return (
                <>
                    {replyShow && <InputBox url={props.url}/>}
                    <div className="Qna-options">
                        <button onClick={handleClickReply}>Reply</button>
                    </div>
                </>
            )
        }

        return (
            props.qnas.map((data, i) => {
                return (
                    <div key={`Qna-${data.qnaId}`}>
                        <Qna data={data}/>
                        <div className="Qna-box">
                            <QnaBox data={data.reply} key={`QnaBox-${data.qnaId}`}/>
                            <ReplyInput url={`/user/${userId}/qnas/${data.qnaId}/replies`} />
                        </div>
                    </div>
                );
            })
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
                })
                .then(response => response.json())
                .then((data) => {
                    setUser(() => data);
                    // console.log(data); // for debug
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
                    <img className="Image-back" src={"/UNI_Logo.png"} alt="배경사진"/>
                </div>
                <div className="Button-section">
                    <MoveButton owner={false}/>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={"/UNI_Logo.png"} alt="프로필사진"/>
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
                                    <span className="Hashtag" key={`hashtag-${i}`}>#{hashtag} </span>
                                )
                            })}
                        </div>
                    </div>
                    <SelfPR title="지도" text={user.region}></SelfPR>
                    <SelfPR title="자기소개" text={user.description}></SelfPR>
                </div>
                <div className="Qna-container">
                    <QnaSection qnas={user.qnas?user.qnas:dummy_qna}/>
                    <InputBox url={`/user/${userId}/qnas`}/>
                </div>
            </div>) : null
    );
}

export default UserPage;