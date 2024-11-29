import React, { useState, useEffect } from 'react';
import './admin.css';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

function AdminPage() {
    const [activeTab, setActiveTab] = useState('신고확인');
    const [selectedAdId, setSelectedAdId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [adData, setAdData] = useState([
        { id: 1, advertiser: '회사 A', title: '여름 세일 광고', status: '게시 전', startDate: '2024-01-01', endDate: '2024-01-31', imageUrl: 'https://via.placeholder.com/300x200' },
        { id: 2, advertiser: '회사 B', title: '신제품 출시', status: '게시 중', startDate: '2024-02-01', endDate: '2024-02-28', imageUrl: 'https://via.placeholder.com/300x200' },
        { id: 3, advertiser: '회사 C', title: '할인 이벤트', status: '게시 종료', startDate: '2024-03-01', endDate: '2024-03-31', imageUrl: 'https://via.placeholder.com/300x200' },
    ]);
    const navigate = useNavigate();

    // 관리자 여부 확인 후 리디렉션
    useEffect(() => {
        const isAdmin = true; // 실제 구현 시 서버에서 관리자 여부를 확인
        if (!isAdmin) {
            navigate('/'); // 관리자가 아닐 경우 홈으로 리디렉션
        }
    }, [navigate]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSelectedAdId(null);
        setCurrentPage(1);
    };

    const handleAdClick = (adId) => {
        setSelectedAdId(selectedAdId === adId ? null : adId);
    };

    const changeAdStatus = async (adId, newStatus) => {
        setAdData((prevData) =>
            prevData.map((ad) =>
                ad.id === adId ? { ...ad, status: newStatus } : ad
            )
        );

        try {
            const response = await fetch('/api/admin/ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId: adId, status: newStatus }),
            });

            const result = await response.json();
            if (result.status !== 'success') {
                console.error('광고 상태 업데이트 실패:', result.message);
            } else {
                console.log('광고 상태가 성공적으로 업데이트되었습니다.');
            }
        } catch (error) {
            console.error('광고 상태 업데이트 중 오류가 발생했습니다:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleNewAdSubmit = async (e) => {
        e.preventDefault();
        const newAd = {
            advertiser: e.target.advertiser.value,
            title: e.target.title.value,
            adStatus: '게시 전',
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
                setAdData([...adData, { ...newAd, id: result.adId }]);
                alert("광고가 성공적으로 등록되었습니다.");
            } else {
                console.error('광고 등록 실패:', result.message);
            }
        } catch (error) {
            console.error('광고 등록 중 오류가 발생했습니다:', error);
        }
    };

    const data = activeTab === '신고확인' ? [] : adData;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, endIndex);

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
            </div>

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
                            <React.Fragment key={ad.id}>
                                <tr onClick={() => handleAdClick(ad.id)}>
                                    <td>{ad.advertiser}</td>
                                    <td>{ad.title}</td>
                                    <td>{ad.startDate} ~ {ad.endDate}</td>
                                    <td className="status">{ad.status}</td>
                                    <td>
                                        <button onClick={() => changeAdStatus(ad.id, '게시 중')}>
                                            광고 게시
                                        </button>
                                    </td>
                                </tr>
                                {selectedAdId === ad.id && (
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
                                                        value={ad.status}
                                                        onChange={(e) => changeAdStatus(ad.id, e.target.value)}
                                                    >
                                                        <option value="게시 전">게시 전</option>
                                                        <option value="게시 중">게시 중</option>
                                                        <option value="게시 종료">게시 종료</option>
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
                    {[...Array(totalPages)].map((_, index) => (
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
