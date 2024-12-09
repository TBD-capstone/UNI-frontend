import "./UserPage.css";
import {useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useState} from "react";
import GoogleMap from "../../components/GoogleMap";
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import ReportModal from "../../components/modal/ReportModal";
import {FaStar} from "react-icons/fa6";
import {postRequestChat} from "../../api/chatAxios";
import {deleteQna, deleteReply, getQna, postQna, postQnaReply} from "../../api/qnaAxios";
import {getReview, postReviewReply} from "../../api/reviewAxios";
import {getMyData, getUserData} from "../../api/userAxios";
import {getMarkers} from "../../api/markerAxios";

const idSame = (idA, idB) => {
    return `${idA}` === `${idB}`;
}

const UserPage = () => {
    const basicProfileImage = '/profile-image.png'
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {userId} = useParams();
    const [isKorean, setIsKorean] = useState(false);
    const [user, setUser] = useState(null);
    const [markers, setMarkers] = useState(null);
    const [activeTab, setActiveTab] = useState('Qna');
    const [report, setReport] = useState(false);
    const [qnas, setQnas] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [commenterId, setCommenterId] = useState(null);
    const [reportedId, setReportedId] = useState(null);
    const language = Cookies.get('language');

    const handleClickReport = useCallback((reportedId) => {
        return () => {
            setReportedId(() => Number(reportedId));
            setReport(() => true);
        }
    }, []);
    const MoveButton = (props) => {
        const handleClickEdit = () => {
            navigate('/user/edit');
        };
        const handleClickChat = () => {
            (async () => {
                const data = await postRequestChat({receiverId: userId}).catch((err) => {
                    alert(t('userPage.chat_error'));
                });
                navigate(`/chat/${data.chatRoomId}`, {state: data});
            })();
        };
        return (
            <div className="button-section">
                {props.owner ?
                    <>
                        <div>{t('userPage.edit_explain')}</div>
                        <button className="Edit" onClick={handleClickEdit}>{t('userPage.edit')}</button>
                    </> :
                    <>
                        <div>{t('userPage.chat_explain1')}{props.userName}{t('userPage.chat_explain2')}</div>
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
                deleteQna({qnaId}).catch((err) => {
                    console.log(err);
                    alert(t("userPage.delete_error"));
                });
            };
        };

        const handleDeleteReply = (replyId) => {
            return () => {
                deleteReply({replyId}).catch((err) => {
                    console.log(err);
                    alert(t("userPage.delete_error"));
                });
            };
        };

        const QnaInputBox = (props) => {
            const [content, setContent] = useState("");

            const handleChangeContent = (e) => {
                setContent(() => e.target.value);
            }
            const handleClickPost = async () => {
                const fetchPOST = () => {
                    if (props.type === 'qna') {
                        return postQna({
                            userId: props.userId,
                            commenterId: props.commenterId,
                            content
                        });
                    } else {
                        return postQnaReply({
                            userId: props.userId,
                            qnaId: props.qnaId,
                            commenterId: props.commenterId,
                            content
                        });
                    }
                };
                await fetchPOST().catch((err) => {
                    console.log(err);
                    alert(t("userPage.chat_error"));
                });
                await fetchGetQnas(userId)
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
                                onClick={props.handleReport(props.data.commentAuthor ? props.data.commentAuthor.userId : props.data.commenterId)}>{t('userPage.report')}</button>
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
                        <div className={'reply-container'}>
                            <QnaInputBox userId={props.userId} qnaId={props.qnaId} commenterId={props.commenterId}
                                         type={'reply'}/>
                        </div>}
                    <div className="qna-options">
                        <button onClick={handleClickReply}>{t("userPage.reply")}</button>
                    </div>
                </>
            )
        }

        return (
            <div className="qna-container">
                <QnaInputBox
                    userId={props.userId}
                    commenterId={props.commenterId}
                    type={'qna'}
                />
                {qnas.length > 0 ? qnas.map((data, i) => {
                    return (
                        <div key={`Qna-${i}`}>
                            <Qna data={data}
                                 owner={data.commentAuthor.userId === props.commenterId}
                                 handleDelete={handleDeleteQna(data.qnaId)}
                                 handleReport={props.handleReport}/>
                            <div className="qna-box" key={`replySection-${i}`}>
                                <QnaBox data={data.replies} key={`QnaBox-${i}`} commenterId={props.commenterId}
                                        handleDelete={handleDeleteReply} handleReport={props.handleReport}/>
                                <ReplyInput
                                    userId={props.userId}
                                    qnaId={data.qnaId}
                                    commenterId={props.commenterId}
                                />
                            </div>
                        </div>
                    );
                }) : <p>{t('userPage.no_qna')}</p>}
            </div>
        );
    };
    const ReviewSection = ({userId, commenterId, reviews, owner}) => {
        const ReviewInputBox = (props) => {
            const [content, setContent] = useState("");

            const handleChangeContent = (e) => {
                setContent(() => e.target.value);
            }
            const handleClickPost = async () => {
                const fetchPOST = async () => {
                    postReviewReply({
                        reviewId: props.reviewId,
                        commenterId: props.commenterId,
                        content: content
                    }).then(() => {
                        return fetchGetReivews(userId);
                    })
                        .catch((err) => {
                            console.log(err);
                            alert(t("userPage.write_error"));
                        });
                };
                await fetchPOST();
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
                <div className="review" key={`reviews-${props.data.reviewId}`}>
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
                        <Review data={data} i={i} owner={owner} commenterId={commenterId}/>);
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
            await getMyData().then((data) => {
                setCommenterId(() => data.userId);
                const isKorean = data.role !== 'EXCHANGE';
                setIsKorean(() => isKorean);
                console.log(data);
            })
                .catch((err) => {
                    console.error(err);
                });
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
        (user && user.visible) ? (
            <div className='user-container'>
                <ReportModal isOpen={report} handleClose={() => setReport(false)} reporterId={Number(commenterId)}
                             reportedId={reportedId}/>
                <div className='image-back-container'>
                    <img className='image-back' src={user.imgBack || '/basic_background.png'} alt="배경사진"/>
                </div>
                <MoveButton owner={idSame(commenterId, userId)} userName={user.userName}/>
                <div className="user-content-container">
                    <div className="image-prof-container">
                        <img className="image-prof" src={user.imgProf || basicProfileImage} alt="프로필사진"/>
                    </div>
                    <div className="profile-container">
                        <h2>{user.userName}</h2>
                        <span>{user.univ}</span>
                        {(!idSame(commenterId, userId) || isKorean) && <p className={'user-star'}><FaStar className={'yellow-star'}/> {user.star}</p>}
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
                    {(!idSame(commenterId, userId) || isKorean) && <>
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
                        {
                            activeTab === 'Qna' &&
                            <QnaSection
                                userId={userId} commenterId={commenterId}
                                handleReport={handleClickReport}/>
                        }
                        {
                            activeTab === 'Review' &&
                            <ReviewSection
                                userId={userId} commenterId={commenterId} reviews={reviews}
                                owner={idSame(commenterId, userId)}/>
                        }
                    </>}
                </div>
            </div>) : null
    );
}

export default UserPage;