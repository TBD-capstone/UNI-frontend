import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import GoogleMap from "./util/GoogleMap";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

const UserPage = () => {
    const { t } = useTranslation();
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [markers, setMarkers] = useState(null);
    const commenterId = Cookies.get('userId');  // 쿠키 적용 예정

    const MoveButton = (props) => {

        const handleClickReport = () => {
            alert(t("userPage.report"));
        };
        const handleClickEdit = () => {
            navigate(`${pathname}/edit`);
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
                    alert(t("userPage.chat_error"));
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
                        <button className="Edit" onClick={handleClickEdit}>{t("userPage.edit")}</button>
                        <button className="ChatRoom">{t("userPage.easter")}</button>
                    </div> :
                    <div>
                        <button className="Chatting" onClick={handleClickChat}>{t("userPage.chat")}</button>
                        <button className="Report" onClick={handleClickReport}> {t("userPage.report")}</button>
                    </div>
            )
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
                            alert(t("userPage.chat_error"));
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
                    <input type="text" value={content} onChange={handleChangeContent} placeholder={t("userPage.qna_placeholder")}/>
                    <button onClick={handleClickPost}>{t("userPage.post")}</button>
                </div>
            )
        }
        const Qna = (props) => {
            return (
                <div className="Reply">
                    <img src={props.data.imageUrl} alt={t("userPage.user_icon_alt")}/>
                    <div>
                        <div className="Reply-content">{props.data.content}</div>
                    </div>
                </div>
            );
        };
        const Reply = (props) => {
            return (
                <div className="Reply">
                    <img src={props.data.imageUrl} alt={t("userPage.user_icon_alt")}/>
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
                        <button onClick={handleClickReply}>{t("userPage.reply")}</button>
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
                    <img className="Image-back" src={user.imgBack} alt="배경사진"/>
                </div>
                <div className="Button-section">
                    <MoveButton owner={commenterId === userId}/>
                </div>
                <div className="Content-container">
                    <div className="Profile-container">
                        <div className="Image-prof-container">
                            <img className="Image-prof" src={user.imgProf} alt="프로필사진"/>
                        </div>
                        <div className="Profile-content">
                            <p>⭐ {user.star}</p>
                            <p>{t("userPage.user")}: {user.userName}</p>
                            <p>{t("userPage.region")}: {user.region}</p>
                            <p>{t("userPage.university")}: {user.univ}</p>
                            <p>{t("userPage.employ_count")}: {user.numEmployment}</p>
                            <p>{t("userPage.time")}: {user.time}</p>
                            <div className="Hashtag-section">
                                {user.hashtags && user.hashtags.map((hashtag, i) => {
                                    return (
                                        <div className="Hashtag" key={`hashtag-${i}`}>
                                            <span>#{hashtag}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="Map-section">
                        <span>{t("userPage.map")}</span>
                        <div className="Map-container">
                            <GoogleMap markers={markers}/>
                        </div>
                    </div>
                    <div className="SelfPR">
                        <span>{t("userPage.self_pr")}</span>
                        <p className="Explain">{user.description}</p>
                    </div>
                </div>
                <QnaSection userId={user.userId} commenterId={commenterId}/>
            </div>) : null
    );
}

export default UserPage;