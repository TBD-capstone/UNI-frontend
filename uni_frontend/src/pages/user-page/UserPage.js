import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import GoogleMap from "./util/GoogleMap";

const UserPage = () => {
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [markers, setMarkers] = useState(null);
    const commenterId = 1;  // 쿠키 적용 예정

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
            fetch("/api/chat/request", {
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

    const QnaSection = (props) => {
        const [qnas, setQnas] = useState(null);

        const InputBox = (props) => {
            const [content, setContent] = useState("");

            const handleChangeContent = (e) => {
                setContent(() => e.target.value);
            }
            const handleClickPost = async () => {
                const fetchPOST = () => {
                    return fetch(`${props.url}`, {
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
                }
                const fetchGET = () => {
                    return fetch(`/api/user/${props.userId}/qnas`, {
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
                            setQnas(() => data);
                            console.log(data);
                            // console.log(data); // for debug
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
                await fetchPOST();
                await fetchGET();
                setContent(() => "");
            };
            return (
                <div className="Input-box">
                    <input type="text" value={content} onChange={handleChangeContent} placeholder="댓글을 써보세요"/>
                    <button onClick={handleClickPost}>Post</button>
                </div>
            )
        }
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
                setReplyShow((p) => !p);
            }
            return (
                <>
                    {replyShow && <InputBox userId={props.userId} url={props.url}/>}
                    <div className="Qna-options">
                        <button onClick={handleClickReply}>Reply</button>
                    </div>
                </>
            )
        }
        useEffect(() => {
            fetch(`/api/user/${props.userId}/qnas`, {
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
                    setQnas(() => data);
                    // console.log(data); // for debug
                })
                .catch((err) => {
                    console.log(err);
                });
        }, [props.userId]);

        return (
            <div className="Qna-container">
                {Array.isArray(qnas) && qnas.map((data, i) => {
                    return (
                        <div key={`Qna-${i}`}>
                            <Qna data={data}/>
                            <div className="Qna-box">
                                <QnaBox data={data.replies} key={`QnaBox-${i}`}/>
                                <ReplyInput
                                    userId={props.userId}
                                    url={`/api/user/${props.userId}/qnas/${data.qnaId}/replies/${props.commenterId}`}
                                />
                            </div>
                        </div>
                    );
                })}
                <InputBox userId={props.userId} url={`/api/user/${props.userId}/qnas/${props.commenterId}`}/>
            </div>
        )
    };

    useEffect(() => {
        (async () => {
            await fetch(`/api/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch((err) => {
                    console.log(err);
                    alert('error: fetch fail');
                })
                .then(response => {
                    if (!response.ok)
                        throw new Error('GET fail');
                    return response.json();
                })
                .then((data) => {
                    setUser(() => data);
                    //console.log(data); // for debug
                })
                .catch((err) => {
                    console.error(err);
                });
            await fetch(`/api/markers/user/${userId}`, {
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
                    setMarkers(() => data);
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
                    <img className="Image-back" src={"/UNI_Background.png"} alt="배경사진"/>
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
                    <div className="Map-section">
                        <span>Map</span>
                        <div className="Map-container">
                            <GoogleMap markers={markers}/>
                        </div>
                    </div>
                    <div className="SelfPR">
                        <span>SelfPR</span>
                        <p className="Explain">{user.description}</p>
                    </div>
                </div>
                <QnaSection userId={user.userId} commenterId={commenterId}/>
            </div>) : <>Page Loading is unaccepted</>
    );
}

export default UserPage;