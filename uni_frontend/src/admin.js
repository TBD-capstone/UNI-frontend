import React, { useState, useEffect } from 'react';
import './admin.css';

const ITEMS_PER_PAGE = 5;

function AdminPage() {
    const [activeTab, setActiveTab] = useState('신고확인');
    const [selectedAdId, setSelectedAdId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [dailyVisitors, setDailyVisitors] = useState(0);
    const [monthlyVisitors, setMonthlyVisitors] = useState(0);

    // 샘플 신고 데이터
    const [reportData, setReportData] = useState([
        { id: 1, reporter: '유저 A', content: '부적절한 내용', date: '2024-01-01' },
        { id: 2, reporter: '유저 B', content: '스팸 광고', date: '2024-01-02' },
        { id: 3, reporter: '유저 C', content: '허위 정보', date: '2024-01-03' },
    ]);

    // 샘플 광고 데이터
    const [adData, setAdData] = useState([
        { id: 1, advertiser: '회사 A', title: '여름 세일 광고', status: '개시중', startDate: '2024-01-01', endDate: '2024-01-31', imageUrl: 'https://via.placeholder.com/300x200' },
        { id: 2, advertiser: '회사 B', title: '신제품 출시', status: '개시하기', startDate: '2024-02-01', endDate: '2024-02-28', imageUrl: 'https://via.placeholder.com/300x200' },
        { id: 3, advertiser: '회사 C', title: '할인 이벤트', status: '개시중', startDate: '2024-03-01', endDate: '2024-03-31', imageUrl: 'https://via.placeholder.com/300x200' },
    ]);

    useEffect(() => {
        setDailyVisitors(150);
        setMonthlyVisitors(3200);
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSelectedAdId(null);
        setCurrentPage(1);
    };

    const handleAdClick = (adId) => {
        setSelectedAdId(selectedAdId === adId ? null : adId);
    };

    const toggleAdStatus = (adId) => {
        setAdData((prevData) =>
            prevData.map((ad) =>
                ad.id === adId
                    ? { ...ad, status: ad.status === '개시중' ? '개시하기' : '개시중' }
                    : ad
            )
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 현재 탭에 따라 데이터를 선택
    const data = activeTab === '신고확인' ? reportData : adData;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, endIndex);

    return (
        <div className="admin-page">
            <div className="visitor-stats">
                <div className="stat-item">
                    <h3>일일 방문자 수</h3>
                    <p>{dailyVisitors}</p>
                </div>
                <div className="stat-item">
                    <h3>월간 방문자 수</h3>
                    <p>{monthlyVisitors}</p>
                </div>
            </div>

            <div className="tabs">
                <div className={`tab ${activeTab === '신고확인' ? 'active' : ''}`} onClick={() => handleTabClick('신고확인')}>
                    신고확인
                </div>
                <div className={`tab ${activeTab === '광고관리' ? 'active' : ''}`} onClick={() => handleTabClick('광고관리')}>
                    광고관리
                </div>
            </div>

            {activeTab === '신고확인' && (
                <div className="table-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>신고자</th>
                            <th>내용</th>
                            <th>날짜</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentData.map((report) => (
                            <React.Fragment key={report.id}>
                                <tr onClick={() => setSelectedAdId(report.id)}>
                                    <td>{report.reporter}</td>
                                    <td>{report.content}</td>
                                    <td>{report.date}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === '광고관리' && (
                <div className="table-container">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>광고주</th>
                            <th>광고 제목</th>
                            <th>기간</th>
                            <th>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentData.map((ad) => (
                            <React.Fragment key={ad.id}>
                                <tr onClick={() => handleAdClick(ad.id)}>
                                    <td>{ad.advertiser}</td>
                                    <td>{ad.title}</td>
                                    <td>{ad.startDate} ~ {ad.endDate}</td>
                                    <td className="status" onClick={(e) => { e.stopPropagation(); toggleAdStatus(ad.id); }}>
                                        {ad.status}
                                    </td>
                                </tr>
                                {selectedAdId === ad.id && (
                                    <tr className="ad-details">
                                        <td colSpan="4">
                                            <div className="ad-image-content">
                                                <h4>광고 이미지</h4>
                                                <img src={ad.imageUrl} alt="광고 이미지" className="image-placeholder" />
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
        </div>
    );
}

export default AdminPage;
