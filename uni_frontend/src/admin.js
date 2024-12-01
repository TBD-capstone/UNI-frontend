import React, { useState, useEffect } from 'react';
import './admin.css';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

function AdminPage() {
    const [activeTab, setActiveTab] = useState('신고확인');
    const [selectedAdId, setSelectedAdId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [adData, setAdData] = useState([]);
    const [reportedUsers, setReportedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    // 관리자 여부 확인 후 리디렉션
    useEffect(() => {
        const isAdmin = true; // 실제 구현 시 서버에서 관리자 여부를 확인
        if (!isAdmin) {
            navigate('/'); // 관리자가 아닐 경우 홈으로 리디렉션
        }
    }, [navigate]);

    // 데이터 불러오기
    useEffect(() => {
        if (activeTab === '광고게시' || activeTab === '광고등록') {
            fetch('/api/admin/ad')
                .then((response) => response.json())
                .then((data) => setAdData(data.ads || []))
                .catch((error) => console.error('광고 데이터 불러오기 실패:', error));
        } else if (activeTab === '신고확인') {
            fetch('/api/admin/reported-users')
                .then((response) => response.json())
                .then((data) => setReportedUsers(data.content || []))
                .catch((error) => console.error('신고된 유저 데이터 불러오기 실패:', error));
        } else if (activeTab === '유저관리') {
            fetchUsers(statusFilter, currentPage - 1); // 페이지는 0부터 시작
        }
    }, [activeTab, statusFilter, currentPage]);

    // 유저 목록 불러오기
    const fetchUsers = (status = '', page = 0) => {
        let url = `/api/admin/users?page=${page}&size=${ITEMS_PER_PAGE}`;
        if (status) url += `&status=${status}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setUsers(data.content || []);
                setTotalPages(data.totalPages || 0);
            })
            .catch((error) => console.error('유저 데이터 불러오기 실패:', error));
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSelectedAdId(null);
        setCurrentPage(1);
    };

    const handleAdClick = (adId) => {
        setSelectedAdId(selectedAdId === adId ? null : adId);
    };

    const changeAdStatus = async (adId, newStatus) => {
        try {
            const response = await fetch('/api/admin/ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId: adId, status: newStatus }),
            });

            const result = await response.json();
            if (result.status === 'success') {
                setAdData((prevData) =>
                    prevData.map((ad) =>
                        ad.adId === adId ? { ...ad, adStatus: newStatus } : ad
                    )
                );
            } else {
                console.error('광고 상태 업데이트 실패:', result.message);
            }
        } catch (error) {
            console.error('광고 상태 업데이트 중 오류가 발생했습니다:', error);
        }
    };

    const handleNewAdSubmit = async (e) => {
        e.preventDefault();
        const newAd = {
            advertiser: e.target.advertiser.value,
            title: e.target.title.value,
            adStatus: 'posted',
            startDate: e.target.startDate.value,
            endDate: e.target.endDate.value,
            imageUrl: e.target.imageUrl.value,
        };

        try {
            const response = await fetch('/api/admin/ad/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAd),
            });
            const result = await response.json();
            if (result.status === 'success') {
                setAdData([...adData, { ...newAd, adId: result.adId }]);
                alert('광고가 성공적으로 등록되었습니다.');
            } else {
                console.error('광고 등록 실패:', result.message);
            }
        } catch (error) {
            console.error('광고 등록 중 오류가 발생했습니다:', error);
        }
    };

    const updateUserStatus = async (userId, newStatus, banDays = 0) => {
        const url = `/api/admin/users/${userId}/status?status=${newStatus}&banDays=${banDays}`;
        try {
            const response = await fetch(url, { method: 'PATCH' });
            const result = await response.json();
            if (result.message) {
                alert(result.message);
                fetchUsers(statusFilter, currentPage - 1);
            } else {
                console.error('유저 상태 업데이트 실패:', result);
            }
        } catch (error) {
            console.error('유저 상태 업데이트 중 오류가 발생했습니다:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const data = activeTab === '신고확인' ? reportedUsers : adData;
    const totalPagesForActiveTab = activeTab === '유저관리' ? totalPages : Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentData = activeTab === '유저관리' ? users : data.slice(startIndex, endIndex);

    return (
        <div className="admin-page">
            <div className="tabs">
                <div className={`tab ${activeTab === '신고확인' ? 'active' : ''}`} onClick={() => handleTabClick('신고확인')}>
                    신고확인
                </div>
                <div className={`tab ${activeTab === '광고게시' ? 'active' : ''}`} onClick={() => handleTabClick('광고게시')}>
                    광고게시
                </div>
                <div className={`tab ${activeTab === '광고등록' ? 'active' : ''}`} onClick={() => handleTabClick('광고등록')}>
                    광고등록
                </div>
                <div className={`tab ${activeTab === '유저관리' ? 'active' : ''}`} onClick={() => handleTabClick('유저관리')}>
                    유저관리
                </div>
            </div>

            {activeTab === '유저관리' && (
                <div>
                    <div className="filter">
                        <label>
                            상태 필터:
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">전체</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="BANNED">BANNED</option>
                            </select>
                        </label>
                    </div>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>이름</th>
                            <th>상태</th>
                            <th>신고 횟수</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentData.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.status}</td>
                                <td>{user.reportCount}</td>
                                <td>
                                    <button onClick={() => updateUserStatus(user.userId, 'BANNED', 7)}>BAN (7일)</button>
                                    <button onClick={() => updateUserStatus(user.userId, 'ACTIVE')}>활성화</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        {[...Array(totalPagesForActiveTab)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === '광고게시' && (
                <div className="table-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>광고주</th>
                            <th>광고 제목</th>
                            <th>기간</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentData.map((ad) => (
                            <React.Fragment key={ad.adId}>
                                <tr onClick={() => handleAdClick(ad.adId)}>
                                    <td>{ad.advertiser}</td>
                                    <td>{ad.title}</td>
                                    <td>{ad.startDate} ~ {ad.endDate}</td>
                                    <td className="status">{ad.adStatus}</td>
                                    <td>
                                        <button onClick={() => changeAdStatus(ad.adId, 'posted')}>광고 게시</button>
                                    </td>
                                </tr>
                                {selectedAdId === ad.adId && (
                                    <tr className="ad-details">
                                        <td colSpan="5">
                                            <div className="ad-image-content">
                                                <h4>광고 이미지</h4>
                                                <img
                                                    src={ad.imageUrl}
                                                    alt="광고 이미지"
                                                    className="selected-ad-image"
                                                />
                                                <div className="ad-status-dropdown">
                                                    <label>상태 변경:</label>
                                                    <select
                                                        value={ad.adStatus}
                                                        onChange={(e) => changeAdStatus(ad.adId, e.target.value)}
                                                    >
                                                        <option value="posted">게시 중</option>
                                                        <option value="ended">게시 종료</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === '광고등록' && (
                <div className="ad-registration">
                    <h3>새 광고 등록</h3>
                    <form onSubmit={handleNewAdSubmit}>
                        <label>
                            광고주:
                            <input type="text" name="advertiser" required />
                        </label>
                        <label>
                            광고 제목:
                            <input type="text" name="title" required />
                        </label>
                        <label>
                            시작 날짜:
                            <input type="date" name="startDate" required />
                        </label>
                        <label>
                            종료 날짜:
                            <input type="date" name="endDate" required />
                        </label>
                        <label>
                            이미지 URL:
                            <input type="text" name="imageUrl" required />
                        </label>
                        <button type="submit">등록</button>
                    </form>
                </div>
            )}

            {activeTab !== '광고등록' && (
                <div className="pagination">
                    {[...Array(totalPagesForActiveTab)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminPage;
