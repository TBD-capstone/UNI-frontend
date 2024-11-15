import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './review.css';

function Review() {
    const { matchingId } = useParams(); // 매칭 ID 가져오기
    const [rating, setRating] = useState(0); // 별점
    const [reviewText, setReviewText] = useState(''); // 후기 내용
    const [statusMessage, setStatusMessage] = useState(''); // 상태 메시지
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating || !reviewText) {
            setStatusMessage('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/user/${matchingId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    star: rating,
                    review: reviewText,
                    date: new Date().toISOString(),
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setStatusMessage('후기 작성이 완료되었습니다!');
                navigate('/matching-status'); // 매칭 상태 페이지로 이동
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

            <form className="review-form" onSubmit={handleSubmit}>
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
        </div>
    );
}

export default Review;
