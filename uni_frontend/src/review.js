import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './review.css';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'; // react-icons에서 별 아이콘 임포트

function Review() {
    const { matchingId } = useParams(); // 매칭 ID 가져오기
    const commenterId = Cookies.get('userId'); // 로그인한 사용자 ID
    const [profileOwnerId, setProfileOwnerId] = useState(null); // 리뷰 대상자 ID
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    // 매칭 ID를 기반으로 GET 요청하여 profileOwnerId 가져오기
    useEffect(() => {
        const fetchProfileOwner = async () => {
            try {
                console.log(`Fetching data for Matching ID: ${matchingId}`);
                const response = await fetch(`/api/match/${matchingId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch matching details');
                }
                const data = await response.json();
                console.log('Matching Details:', data);
                setProfileOwnerId(data.profileOwnerId);
            } catch (error) {
                console.error('Error fetching matching details:', error);
                setStatusMessage('매칭 정보를 가져오는 중 오류가 발생했습니다.');
            }
        };

        fetchProfileOwner();
    }, [matchingId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!rating || !reviewText.trim()) {
            setStatusMessage('모든 필드를 입력해주세요.');
            return;
        }

        if (!profileOwnerId) {
            setStatusMessage('리뷰 대상자를 확인할 수 없습니다.');
            return;
        }

        try {
            console.log('Submitting Review...');
            console.log(`Rating: ${rating}`);
            console.log(`Review Text: ${reviewText.trim()}`);
            console.log(`API Endpoint: /api/user/${profileOwnerId}/review/${commenterId}/matching/${matchingId}`);

            const response = await fetch(`/api/user/${profileOwnerId}/review/${commenterId}/matching/${matchingId}`, {
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

            console.log('API Response:', data);

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
                            <span key={star}>
                                {hoverRating >= star || rating >= star ? (
                                    <AiFillStar
                                        size={30}
                                        color="#FFD700" // 별색을 금색으로 설정
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    />
                                ) : (
                                    <AiOutlineStar
                                        size={30}
                                        color="#D3D3D3" // 빈 별색을 회색으로 설정
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    />
                                )}
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
