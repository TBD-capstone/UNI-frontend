import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import GoogleMap from "../../components/GoogleMap";
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import ReportModal from "../../components/modal/ReportModal";

const UserPage = () => {
    const {t} = useTranslation();
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [markers, setMarkers] = useState(null);
    const [activeTab, setActiveTab] = useState('Qna');
    const [report, setReport] = useState(false);
    const commenterId = Cookies.get('userId');

    const MoveButton = (props) => {
        const handleClickReport = () => {
            setReport(() => true);
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
            <div className="button-section">
                {props.owner ?
                    <>
                        프로필을 자유롭게 수정해보세요.
                        <button className="Edit" onClick={handleClickEdit}>{t('userPage.edit')}</button>
                    </> :
                    <>
                        궁금한게 있다면 {props.userName}님에게 채팅으로 물어볼 수 있습니다.
                        <button className="Chatting" onClick={handleClickChat}>{t('userPage.chat')}</button>
                        <button className="Report" onClick={handleClickReport}>{t('userPage.report')}</button>
                    </>
                }
            </div>

        )
    };
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const QnaSection = (props) => {
        const [qnas, setQnas] = useState([]);

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
                <div className="input-box">
                    <input type="text" value={content} onChange={handleChangeContent}
                           placeholder={t("userPage.qna_placeholder")}/>
                    <button onClick={handleClickPost}>{t("userPage.post")}</button>
                </div>
            )
        }
        const Qna = (props) => {
            return (
                <div className="qna">
                    <img src={props.data.imgProf || '/UNI_Logo.png'} alt={t("userPage.user_icon_alt")}/>
                    <div>
                        <div className='qna-user'>{props.data.commentAuthor ? props.data.commentAuthor.name : (props.data.commenterName ? props.data.commenterName : null)}</div>
                        <div className='qna-content'>{props.data.content}</div>
                    </div>
                    <div className={'qna-options'}>
                        { props.data.userId === props.commenterId ?
                            <button>삭제</button> :
                            <button>신고</button>
                        }
                    </div>
                </div>
            );
        };

        const QnaBox = (props) => {
            return (
                props.data && props.data.map((data) => {
                    return <div className={'reply-container'}><Qna data={data} commenterId={props.commenterId} key={`Reply-${data.qnaId}-${data.replyId}`}/></div>;
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
                    {replyShow && <div className={'reply-container'}><InputBox userId={props.userId} url={props.url}/></div>}
                    <div className="qna-options">
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
            <div className="qna-container">
                <InputBox userId={props.userId} url={`/api/user/${props.userId}/qnas/${props.commenterId}`}/>
                {qnas.length > 0 ? qnas.map((data, i) => {
                    return (
                        <div key={`Qna-${i}`}>
                            <Qna data={data} commenterId={props.commenterId}/>
                            <div className="qna-box" key={`replySection-${i}`}>
                                <QnaBox data={data.replies} key={`QnaBox-${i}`} commenterId={props.commenterId}/>
                                <ReplyInput
                                    userId={props.userId}
                                    url={`/api/user/${props.userId}/qnas/${data.qnaId}/replies/${props.commenterId}`}
                                />
                            </div>
                        </div>
                    );
                }):<p>아직 작성된 Q&A가 없습니다.</p>}
            </div>
        )
    };
    const ReviewSection = (props) => {
        const [reviews, setReviews] = useState([]);

        const Review = (props) => {

            return (
                <div className="review">
                    <span>Reviewer: {props.data.commenterName}</span>
                    <span className="Star">⭐ {props.data.star}</span>
                    <p>{props.data.content}</p>
                </div>
            );
        }

        useEffect(() => {
            fetch(`/api/review/${props.userId}`, {
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
                    setReviews(() => data);
                    // console.log(data); // for debug
                })
                .catch((err) => {
                    console.log(err);
                });
        }, [props.userId]);
        return (
            <div className="review-section">
                {reviews.length > 0 ? reviews.map((data, i) => {
                    return (<Review data={data} key={`reviews-${i}`}/>);
                }):<p>아직 작성된 리뷰가 없습니다.</p>}
            </div>
        )
    }

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
            <div className='user-container'>
                <ReportModal isOpen={report} handleClose={() => setReport(false)}/>
                <div className='Image-back-container'>
                    <img className='Image-back' src={user.imgBack || '/UNI_Background.png'} alt="배경사진"/>
                </div>
                <MoveButton owner={commenterId === userId} userName={user.userName}/>
                <div className="user-content-container">
                    <div className="Image-prof-container">
                        <img className="Image-prof" src={user.imgProf || '/UNI_Logo.png'} alt="프로필사진"/>
                    </div>
                    <div className="profile-container">
                        <h2>{user.userName}</h2>
                        <span>from {user.univ}</span>
                        <span className={'user-star'}>⭐ {user.star}</span>
                        <p>{t("userPage.region")}: {user.region}</p>
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
                    <div className="selfPR-container">
                        <h3>{t("userPage.self_pr")}</h3>
                        <p className="selfPR">{user.description}</p>
                    </div>
                    <div className="Map-section">
                        <h3>{t("userPage.map")}</h3>
                        <div className="Map-container">
                            <GoogleMap markers={markers}/>
                        </div>
                    </div>
                    <div className="user-tabs">
                        <div className={`tab ${activeTab === 'Qna' ? 'active' : ''}`}
                             onClick={() => handleTabClick('Qna')}>
                            Q&A
                        </div>
                        <div className={`tab ${activeTab === 'Review' ? 'active' : ''}`}
                             onClick={() => handleTabClick('Review')}>
                            Review
                        </div>
                    </div>
                    {activeTab === 'Qna' && <QnaSection userId={user.userId} commenterId={commenterId}/>}
                    {activeTab === 'Review' && <ReviewSection userId={user.userId}/>}
                </div>
            </div>) : null
    );
}

export default UserPage;