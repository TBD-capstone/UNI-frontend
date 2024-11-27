import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useState} from "react";
import GoogleMap from "../../components/GoogleMap";
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import ReportModal from "../../components/modal/ReportModal";
import {FaStar} from "react-icons/fa6";
import profileImage from "../../../public/profile-image.png"

const UserPage = () => {
    const {t} = useTranslation();
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [markers, setMarkers] = useState(null);
    const [activeTab, setActiveTab] = useState('Qna');
    const [report, setReport] = useState(false);
    const [qnas, setQnas] = useState([]);
    const commenterId = Cookies.get('userId');

    const handleClickReport = useCallback(() => {
        setReport(() => true);
    }, []);
    const MoveButton = (props) => {
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
                        {t('userPage.edit_explain')}
                        <button className="Edit" onClick={handleClickEdit}>{t('userPage.edit')}</button>
                    </> :
                    <>
                        {t('userPage.chat_explain1')}{props.userName}{t('userPage.chat_explain2')}
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
        const handleDeleteQna = (qnaId) => {
            return () => {
                fetch(`/api/qnas/${qnaId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .catch((err) => {
                        console.log(err);
                        alert(t("userPage.delete_error"));
                    });
            };
        };

        const handleDeleteReply = (replyId) => {
            return () => {
                fetch(`/api/replies/${replyId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then((response) => console.log(response))
                    .catch((err) => {
                        console.log(err);
                        alert(t("userPage.delete_error"));
                    });
            };
        };

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
                };
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
            const handleKeyDownPost = (e) => {
                if (e.key === "Enter") {
                    handleClickPost();
                }
            }
            return (
                <div className="input-box">
                    <input type="text" value={content} onChange={handleChangeContent}
                           placeholder={t("userPage.qna_placeholder")}
                           onKeyDown={(e) => handleKeyDownPost(e)}/>
                    <button onClick={handleClickPost}>{t("userPage.post")}</button>
                </div>
            )
        }
        const Qna = (props) => {
            return (
                <div className="qna">
                    <img src={props.data.imgProf || profileImage} alt={t("userPage.user_icon_alt")}/>
                    <div>
                        <div
                            className='qna-user'>{props.data.commentAuthor ? props.data.commentAuthor.name : (props.data.commenterName ? props.data.commenterName : null)}</div>
                        <div className='qna-content'>{props.data.content}</div>
                    </div>
                    {props.owner ?
                        <button className={'qna-button'} onClick={props.handleDelete}>{t('userPage.delete')}</button> :
                        <button className={'qna-button'} onClick={props.handleReport}>{t('userPage.report')}</button>
                    }
                </div>
            );
        };

        const QnaBox = (props) => {
            return (
                props.data && props.data.map((data, i) => {
                    // console.log(typeof (props.commenterId));
                    // console.log(typeof (data.commenterId));
                    return <div className={'reply-container'} key={`reply-container-${i}`}>
                        <Qna
                            data={data}
                            owner={data.commenterId === props.commenterId}
                            key={`Reply-${data.qnaId}-${data.replyId}`}
                            handleDelete={props.handleDelete(data.replyId)}
                            handleReport={props.handleReport}
                        />
                    </div>;
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
                    {replyShow &&
                        <div className={'reply-container'}><InputBox userId={props.userId} url={props.url}/></div>}
                    <div className="qna-options">
                        <button onClick={handleClickReply}>{t("userPage.reply")}</button>
                    </div>
                </>
            )
        }
        // useEffect(() => {
        //     fetch(`/api/user/${props.userId}/qnas`, {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     })
        //         .catch((err) => {
        //             console.log(err);
        //             alert('error: fetch fail');
        //         })
        //         .then(response => response.json())
        //         .then((data) => {
        //             setQnas((prev) => {
        //                 if (prev !== data) {
        //                     return data;
        //                 }
        //                 return prev; // 데이터가 같다면 업데이트하지 않음
        //             });
        //             console.log(data); // for debug
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //         });
        // }, []);

        return (
            <div className="qna-container">
                <InputBox userId={props.userId} url={`/api/user/${props.userId}/qnas/${props.commenterId}`}/>
                {qnas.length > 0 ? qnas.map((data, i) => {
                    return (
                        <div key={`Qna-${i}`}>
                            <Qna data={data}
                                 owner={data.userId === props.commenterId}
                                 handleDelete={handleDeleteQna(data.qnaId)}
                                 handleReport={props.handleReport}/>
                            <div className="qna-box" key={`replySection-${i}`}>
                                <QnaBox data={data.replies} key={`QnaBox-${i}`} commenterId={props.commenterId}
                                        handleDelete={handleDeleteReply} handleReport={props.handleReport}/>
                                <ReplyInput
                                    userId={props.userId}
                                    url={`/api/user/${props.userId}/qnas/${data.qnaId}/replies/${props.commenterId}`}
                                />
                            </div>
                        </div>
                    );
                }) : <p>{t('userPage.no_qna')}</p>}
            </div>
        )
    };
    const ReviewSection = (props) => {
        const [reviews, setReviews] = useState([]);

        const Review = (props) => {
            return (
                <div className="review">
                    <div className={'review-profile'}>
                        <img src={props.data.commenterImgProf ? props.data.commenterImgProf : profileImage} alt={'./profile'}/>
                        <span className='review-reviewer'>{props.data.commenterName}</span>
                    </div>
                    <div className="review-star"><FaStar className={'yellow-star'}/> {props.data.star}</div>
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
                    console.log(data); // for debug
                })
                .catch((err) => {
                    console.log(err);
                });
        }, [props.userId]);
        return (
            <div className="review-section">
                {reviews.length > 0 ? reviews.map((data, i) => {
                    return (<Review data={data} key={`reviews-${i}`}/>);
                }) : <p>{t('userPage.no_review')}</p>}
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
                    console.log(data); // for debug
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
            fetch(`/api/user/${userId}/qnas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch((err) => {
                    console.log(err);
                    alert('loading fail');
                })
                .then(response => response.json())
                .then((data) => {
                    setQnas((prev) => {
                        if (prev !== data) {
                            return data;
                        }
                        return prev; // 데이터가 같다면 업데이트하지 않음
                    });
                    console.log(data); // for debug
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
                    <img className='Image-back' src={user.imgBack || '/basic_background.png'} alt="배경사진"/>
                </div>
                <MoveButton owner={commenterId === userId} userName={user.userName}/>
                <div className="user-content-container">
                    <div className="image-prof-container">
                        <img className="image-prof" src={user.imgProf || profileImage} alt="프로필사진"/>
                    </div>
                    <div className="profile-container">
                        <h2>{user.userName}</h2>
                        <span>{user.univ}</span>
                        <p className={'user-star'}><FaStar className={'yellow-star'}/> {user.star}</p>
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
                    {activeTab === 'Qna' &&
                        <QnaSection userId={userId} commenterId={Number(commenterId)} handleReport={handleClickReport}/>}
                    {activeTab === 'Review' && <ReviewSection userId={userId}/>}
                </div>
            </div>) : null
    );
}

export default UserPage;