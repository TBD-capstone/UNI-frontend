import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // 쿠키에서 로그인 사용자 정보 가져오기
import './review.css';

function Review() {
    const { matchingId, userId } = useParams(); // URL에서 매칭 ID와 대상 유저 ID 가져오기
    const commenterId = Cookies.get('userId'); // 로그인한 사용자 ID를 쿠키에서 가져오기
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    // 컴포넌트가 렌더링될 때 매칭 ID와 관련된 정보를 콘솔에 출력
    useEffect(() => {
        console.log(`Matching ID: ${matchingId}`);
        console.log(`User ID (Target): ${userId}`);
        console.log(`Commenter ID (Logged-in User): ${commenterId}`);
    }, [matchingId, userId, commenterId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!rating || !reviewText.trim()) {
            setStatusMessage('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/user/${userId}/review/${commenterId}/matching/${matchingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: reviewText.trim(),
                    star: rating,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage('후기 작성이 완료되었습니다!');
                navigate('/matching-list');
            } else {
                setStatusMessage(data.message || '후기 작성에 실패하였습니다.');
            }
        } catch (error) {
            setStatusMessage('후기 작성 중 오류가 발생했습니다.');
            console.error('Error submitting review:', error);
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
                                className={`star ${hoverRating >= star || rating >= star ? 'filled' : ''}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ⭐
                            </span>
                        ))}
                    </div>
                    <p className="rating-text">
                        {rating > 0 ? `선택한 별점: ${rating}점` : '별점을 선택해주세요.'}
                    </p>
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
        </div>
    );
}

export default Review;
