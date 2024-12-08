import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './matchingList.css';
import {getMyData} from "../../api/userAxios";
import {getReceiveMatchList, getRequestMatchList} from "../../api/matchAxios";

function MatchingStatus() {
    const [matches, setMatches] = useState([]); // 매칭 데이터
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isKorean, setIsKorean] = useState(false); // 한국인 여부
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [matchesPerPage] = useState(5); // 한 페이지에 보일 매칭 수

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const result = await getMyData();
                const koreanStatus = result.role !== 'EXCHANGE';
                const userId = result.userId;

                setIsKorean(koreanStatus);

                if (!userId) {
                    setError('유저 ID가 제공되지 않았습니다.');
                    return;
                }

                const response = koreanStatus
                    ? await getReceiveMatchList({receiverId: userId})
                    : await getRequestMatchList({requesterId: userId});
                const data = await response.data;

                if (response.status === 200) {
                    // 매칭 데이터를 시간 기준으로 내림차순 정렬
                    const sortedMatches = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setMatches(sortedMatches);
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

    const getStatusClassName = (status) => {
        switch (status) {
            case 'PENDING':
                return 'status-pending';
            case 'ACCEPTED':
                return 'status-accepted';
            case 'REJECTED':
                return 'status-rejected';
            default:
                return 'status-default';
        }
    };

    // 현재 페이지에 해당하는 매칭 데이터를 가져오기
    const indexOfLastMatch = currentPage * matchesPerPage;
    const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
    const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);

    // 페이지네이션 처리
    const totalPages = Math.ceil(matches.length / matchesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류 발생: {error}</div>;
    }

    return (
        <div className="matching-status-page">
            <h1>매칭 목록</h1>

            {matches.length > 0 ? (
                <ul className="matching-list">
                    {currentMatches.map((match) => {
                        const matchPartnerId = isKorean ? match.requesterId : match.receiverId;

                        return (
                            <li key={match.matchingId} className="matching-item">
                                <div className="matching-info">
                                    <p className="match-name">{match.userName}</p>
                                    <p className={`match-status ${getStatusClassName(match.status)}`}>
                                        {match.status}
                                    </p>
                                    <p className="match-date">
                                        매칭 날짜: {new Date(match.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {!isKorean && match.status === 'ACCEPTED' && (
                                    <Link
                                        to={`/review/${match.matchingId}`}
                                        className="review-button"
                                        state={{
                                            matchPartnerId: matchPartnerId,
                                            matchingId: match.matchingId,
                                        }}
                                    >
                                        후기 작성
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>매칭 중인 혹은 매칭 완료된 매칭이 없습니다.</p>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        이전
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}

export default MatchingStatus;
