import React, { useState } from 'react';
import './Review.css'; // 스타일 파일은 필요에 따라 생성하세요.

function Review() {
    const [star, setStar] = useState(0); // 별점
    const [review, setReview] = useState(''); // 후기 내용
    const [statusMessage, setStatusMessage] = useState(''); // 상태 메시지
    const [userId, setUserId] = useState(''); // 후기를 받을 사용자 ID

    // 별점 선택 핸들러
    const handleStarChange = (newStar) => {
        setStar(newStar);
    };

    // 후기 작성 요청 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!star || !review || !userId) {
            setStatusMessage('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/user/${userId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId, // 후기를 받을 유저 ID
                    star, // 별점
                    review, // 후기 내용
                    date: new Date().toISOString(), // 작성 시간
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setStatusMessage('후기 작성이 완료되었습니다!');
                setStar(0);
                setReview('');
                setUserId('');
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
                {/* 대상 사용자 입력 */}
                <div className="form-group">
                    <label htmlFor="userId">후기를 받을 사용자 ID:</label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="사용자 ID 입력"
                        required
                    />
                </div>

                {/* 별점 선택 */}
                <div className="form-group">
                    <label>별점:</label>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                            <span
                                key={starValue}
                                className={`star ${star >= starValue ? 'filled' : ''}`}
                                onClick={() => handleStarChange(starValue)}
                            >
                                ⭐
                            </span>
                        ))}
                    </div>
                </div>

                {/* 후기 내용 */}
                <div className="form-group">
                    <label htmlFor="review">후기 내용:</label>
                    <textarea
                        id="review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="후기 내용을 입력해주세요."
                        rows="5"
                        required
                    />
                </div>

                {/* 제출 버튼 */}
                <button type="submit" className="submit-button">
                    후기 제출
                </button>
            </form>

            {/* 상태 메시지 표시 */}
            {statusMessage && <div className="status-message">{statusMessage}</div>}
        </div>
    );
}

export default Review;
