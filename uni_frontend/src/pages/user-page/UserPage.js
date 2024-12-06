import "./UserPage.css";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useState} from "react";
import GoogleMap from "../../components/GoogleMap";
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import ReportModal from "../../components/modal/ReportModal";
import {FaStar} from "react-icons/fa6";
import {postRequestChat} from "../../api/chatAxios";
import {deleteQna, deleteReply, getQna, postQnaReply} from "../../api/qnaAxios";
import {getReview} from "../../api/reviewAxios";
import {getUserData} from "../../api/userAxios";
import {getMarkers} from "../../api/markerAxios";

const UserPage = () => {
    const basicProfileImage = '/profile-image.png'
    const {t} = useTranslation();
    const {userId} = useParams();
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [markers, setMarkers] = useState(null);
    const [activeTab, setActiveTab] = useState('Qna');
    const [report, setReport] = useState(false);
    const [qnas, setQnas] = useState([]);
    const [reviews, setReviews] = useState([]);
    const commenterId = Cookies.get('userId');
    const language = Cookies.get('language');
    const [reportedId, setReportedId] = useState(null);

    const handleClickReport = useCallback((reportedId) => {
        return () => {
            setReportedId(() => reportedId);
            setReport(() => true);
        }
    }, []);
    const MoveButton = (props) => {
        const handleClickEdit = () => {
            navigate('/user/edit');
        };
        const handleClickChat = () => {
            (async () => {
                const data = await postRequestChat({receiverId: userId});
                navigate(`/chat/${data.chatRoomId}`, {state: data});
            })();
        };
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
                        <button className="Report" onClick={handleClickReport(userId)}>{t('userPage.report')}</button>
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
                deleteQna(qnaId).catch((err) => {
                    console.log(err);
                    alert(t("userPage.delete_error"));
                });
            };
        };

        const handleDeleteReply = (replyId) => {
            return () => {
                deleteReply(replyId).catch((err) => {
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
                await fetchPOST();
                await fetchGetQnas(props.userId)
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
                           placeholder={(props.type === 'qna' ? t("userPage.qna_placeholder") : t("userPage.qna_reply_placeholder"))}
                           onKeyDown={(e) => handleKeyDownPost(e)}/>
                    <button onClick={handleClickPost}>{t("userPage.post")}</button>
                </div>
            )
        }
        const Qna = (props) => {
            return (
                <div className="qna">
                    <img src={props.data.imgProf || basicProfileImage} alt={t("userPage.user_icon_alt")}/>
                    <div>
                        <div
                            className='qna-user'>{props.data.commentAuthor ? props.data.commentAuthor.name : (props.data.commenterName ? props.data.commenterName : null)}</div>
                        <div
                            className='qna-content'>{props.data.deleted ? props.data.deletedMessage : props.data.content}</div>
                    </div>
                    {props.owner ?
                        <button className={'qna-button'} onClick={props.handleDelete}>{t('userPage.delete')}</button> :
                        <button className={'qna-button'}
                                onClick={props.handleReport(props.data.commenterAuthor ? props.data.commenterAuthor.userId : props.data.commenterId)}>{t('userPage.report')}</button>
                    }
                </div>
            );
        };

        const QnaBox = (props) => {
            return (
                props.data && props.data.map((data, i) => {
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
                <InputBox
                    userId={props.userId}
                    url={`/api/user/${props.userId}/qnas/${props.commenterId}`}
                    type={'qna'}
                />
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
    const ReviewSection = ({userId, commenterId, reviews, owner}) => {
        const ReviewInputBox = (props) => {
            const [content, setContent] = useState("");

            const handleChangeContent = (e) => {
                setContent(() => e.target.value);
            }
            const handleClickPost = async () => {
                const fetchPOST = () => {
                    postQnaReply({reviewId: props.reviewId, commenterId: props.commenterId})
                        .catch((err) => {
                            console.log(err);
                            alert(t("userPage.chat_error"));
                        });
                };
                await fetchPOST();
                await fetchGetReivews(userId);
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
                           placeholder={t("userPage.review_reply_placeholder")}
                           onKeyDown={(e) => handleKeyDownPost(e)}/>
                    <button onClick={handleClickPost}>{t("userPage.post")}</button>
                </div>
            )
        }

        const Review = (props) => {
            return (
                <div className="review">
                    <div className={'review-profile'}>
                        <img src={props.data.commenterImgProf ? props.data.commenterImgProf : basicProfileImage}
                             alt={'./profile'}/>
                        <span className='review-reviewer'>{props.data.commenterName}</span>
                    </div>
                    <div className="review-star"><FaStar className={'yellow-star'}/> {props.data.star}</div>
                    <p>{props.data.content}</p>
                    {props.data.replies.length > 0 && props.data.replies.map((data, i) => {
                        return (
                            <div className={'review-reply'}>
                                <div className={'review-profile'}>
                                    <img src={data.commenterImgProf ? data.commenterImgProf : basicProfileImage}
                                         alt={'./profile'}/>
                                    <span className='review-reviewer'>{data.commenterName}</span>
                                </div>
                                <p>{data.content}</p>
                            </div>
                        )
                    })}
                    {props.owner && <ReviewInputBox reviewId={props.data.reviewId} commenterId={props.commenterId}/>}
                </div>
            );
        }
        return (
            <div className="review-section">
                {reviews.length > 0 ? reviews.map((data, i) => {
                    return (
                        <Review data={data} key={`reviews-${i}`} owner={owner} commenterId={commenterId}/>);
                }) : <p>{t('userPage.no_review')}</p>}
            </div>
        )
    }

    function fetchGetQnas(userId) {
        return getQna({userId}).then((data) => {
                setQnas((prev) => {
                    if (prev !== data) {
                        return data;
                    }
                    return prev;
                });
                // console.log(data); // for debug
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function fetchGetReivews(userId) {
        return getReview({userId}).then((data) => {
                setReviews(() => data);
                // console.log(data); // for debug
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        (async () => {
            if (!userId)
                return;
            await getUserData({userId}).then((data) => {
                    setUser(() => data);
                    console.log(data); // for debug
                })
                .catch((err) => {
                    console.error(err);
                });
            await getMarkers({userId}).then((data) => {
                    setMarkers(() => data);
                })
                .catch((err) => {
                    console.log(err);
                });
            await fetchGetQnas(userId);
            await fetchGetReivews(userId);
        })();
    }, [userId, language]);

    return (
        user ? (
            <div className='user-container'>
                <ReportModal isOpen={report} handleClose={() => setReport(false)} reporterId={Number(commenterId)}
                             reportedId={reportedId}/>
                <div className='Image-back-container'>
                    <img className='Image-back' src={user.imgBack || '/basic_background.png'} alt="배경사진"/>
                </div>
                <MoveButton owner={commenterId === userId} userName={user.userName}/>
                <div className="user-content-container">
                    <div className="image-prof-container">
                        <img className="image-prof" src={user.imgProf || basicProfileImage} alt="프로필사진"/>
                    </div>
                    <div className="profile-container">
                        <h2>{user.userName}</h2>
                        <span>{user.univ}</span>
                        <p className={'user-star'}><FaStar className={'yellow-star'}/> {user.star}</p>
                        <p>{t("userPage.region")}: {user.region}</p>
                        <p>{t("userPage.time")}: {user.time}</p>
                        <div className="hashtag-section">
                            {user.hashtags && user.hashtags.map((hashtag, i) => {
                                return (
                                    <div className="hashtag-item" key={`hashtag-${i}`}>
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
                        <QnaSection
                            userId={userId} commenterId={Number(commenterId)}
                            handleReport={handleClickReport}/>}
                    {activeTab === 'Review' &&
                        <ReviewSection
                            userId={userId} commenterId={commenterId} reviews={reviews}
                            owner={commenterId === `${userId}`}/>}
                </div>
            </div>) : null
    );
}

export default UserPage;