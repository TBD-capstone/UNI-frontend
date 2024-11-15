import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './matchingList.css';

function MatchingStatus() {
    const [matches, setMatches] = useState([]); // 매칭 데이터
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const userId = localStorage.getItem('userId'); // 로그인된 유저 ID 가져오기
                const response = await fetch(`/api/match/list/receiver/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setMatches(data);
                } else {
                    setError(data.message || '매칭 데이터를 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError('매칭 데이터를 불러오는 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error}</div>;
    }

    return (
        <div className="matching-status-page">
            <h1>매칭 상태</h1>

            {matches.length > 0 ? (
                <ul className="matching-list">
                    {matches.map((match) => (
                        <li key={match.matchingId} className="matching-item">
                            <div>
                                <p>매칭 상대: {match.requesterId}</p>
                                <p>상태: {match.status}</p>
                                <p>생성 날짜: {new Date(match.createdAt).toLocaleDateString()}</p>
                            </div>
                            {match.status === '완료됨' && (
                                <Link to={`/review/${match.matchingId}`} className="review-button">
                                    후기 작성
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>현재 매칭된 항목이 없습니다.</p>
            )}
        </div>
    );
}

export default MatchingStatus;