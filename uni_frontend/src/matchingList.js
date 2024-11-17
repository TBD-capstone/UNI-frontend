import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './matchingList.css';

function MatchingStatus() {
    const { userId: paramUserId } = useParams(); // URL에서 userId 가져오기
    const [matches, setMatches] = useState([]); // 매칭 데이터
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isKorean, setIsKorean] = useState(false); // 한국인 여부
    const userId = paramUserId || Cookies.get('userId'); // URL에서 가져오지 못하면 쿠키에서 가져오기

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const koreanStatus = Cookies.get('isKorean') === 'true'; // 쿠키에서 한국인 여부 확인
                setIsKorean(koreanStatus);

                if (!userId) {
                    setError('유저 ID가 제공되지 않았습니다.');
                    return;
                }

                const apiUrl = koreanStatus
                    ? `/api/match/list/receiver/${userId}`
                    : `/api/match/list/requester/${userId}`;

                const response = await fetch(apiUrl);
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
    }, [userId]);

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
                            {!isKorean && match.status === 'ACCEPTED' && (
                                <Link to={`/review/${match.matchingId}`} className="review-button">
                                    후기 작성
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>매칭 중인 혹은 매칭 완료된 매칭이 없습니다.</p>
            )}
        </div>
    );
}

export default MatchingStatus;
