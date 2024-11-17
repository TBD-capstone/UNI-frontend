import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './review.css';

function Review() {
    const { userId, commenterId } = useParams(); // URL에서 userId와 commenterId 가져오기
    const [rating, setRating] = useState(0); // 별점
    const [reviewText, setReviewText] = useState(''); // 후기 내용
    const [responseText, setResponseText] = useState(''); // 답변 내용
    const [statusMessage, setStatusMessage] = useState(''); // 상태 메시지
    const [responseStatusMessage, setResponseStatusMessage] = useState(''); // 답변 상태 메시지
    const [reviewSubmitted, setReviewSubmitted] = useState(false); // 후기 제출 여부
    const navigate = useNavigate();

    useEffect(() => {
        // 만약 후기 데이터를 초기화하거나 불러오는 기능이 있다면 여기에 추가
    }, []);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!rating || !reviewText) {
            setStatusMessage('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/user/${userId}/review/${commenterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: reviewText,
                    star: rating,
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setStatusMessage('후기 작성이 완료되었습니다!');
                setReviewSubmitted(true);
            } else {
                setStatusMessage(data.message || '후기 작성에 실패하였습니다.');
            }
        } catch (error) {
            setStatusMessage('후기 작성 중 오류가 발생했습니다.');
            console.error('Error submitting review:', error);
        }
    };

    const handleSubmitResponse = async (e) => {
        e.preventDefault();

        if (!responseText) {
            setResponseStatusMessage('답변 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/user/${userId}/response/${commenterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    response: responseText,
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setResponseStatusMessage('답변 작성이 완료되었습니다!');
                navigate('/matching-status'); // 매칭 상태 페이지로 이동
            } else {
                setResponseStatusMessage(data.message || '답변 작성에 실패하였습니다.');
            }
        } catch (error) {
            setResponseStatusMessage('답변 작성 중 오류가 발생했습니다.');
            console.error('Error submitting response:', error);
        }
    };

    return (
        <div className="review-page">
            <h1 className="review-title">후기 작성</h1>

            <form className="review-form" onSubmit={handleSubmitReview}>
                <div className="form-group">
                    <label>별점:</label>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${rating >= star ? 'filled' : ''}`}
                                onClick={() => setRating(star)}
                            >
                                ⭐
                            </span>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="reviewText">후기 내용:</label>
                    <textarea
                        id="reviewText"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="후기 내용을 입력해주세요."
                        rows="5"
                        required
                    />
                </div>

                <button type="submit" className="submit-button">
                    후기 제출
                </button>
            </form>

            {statusMessage && <div className="status-message">{statusMessage}</div>}

            {reviewSubmitted && (
                <div className="response-section">
                    <h2>후기에 대한 답변 작성</h2>

                    <form className="response-form" onSubmit={handleSubmitResponse}>
                        <div className="form-group">
                            <label htmlFor="responseText">답변 내용:</label>
                            <textarea
                                id="responseText"
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="답변 내용을 입력해주세요."
                                rows="5"
                                required
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            답변 제출
                        </button>
                    </form>

                    {responseStatusMessage && (
                        <div className="status-message">{responseStatusMessage}</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Review;
