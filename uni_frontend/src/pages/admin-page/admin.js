import React, { useState, useEffect } from 'react';
import './admin.css';
import { useNavigate } from 'react-router-dom';
import {
    getAdListByAdmin,
    getReportedUserListByAdmin,
    getUserListByAdmin,
    patchUserStateByAdmin,
    postAdNewByAdmin
} from "../../api/adminAxios";

const ITEMS_PER_PAGE = 5;

function AdminPage() {
    const [activeTab, setActiveTab] = useState('신고확인');
    const [currentPage, setCurrentPage] = useState(1);
    const [adData, setAdData] = useState([]);
    const [reportedUsers, setReportedUsers] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [expandedAdId, setExpandedAdId] = useState(null);
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [banDays, setBanDays] = useState({});
    const [adForm, setAdForm] = useState({ advertiser: '', title: '', startDate: '', endDate: '' });
    const [adImage, setAdImage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = true;
        if (!isAdmin) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(async () => {
        if (activeTab === '광고게시') {
            const data = await getAdListByAdmin();
            setAdData(data.ads || []);
        } else if (activeTab === '신고확인') {
            fetchReportedUsers(currentPage - 1);
        } else if (activeTab === '유저관리') {
            fetchUsers(statusFilter, currentPage - 1);
        }
    }, [activeTab, statusFilter, currentPage]);

    const fetchReportedUsers = async (page = 0) => {
        const data = await getReportedUserListByAdmin(`page=${page}&size=${ITEMS_PER_PAGE}`);

        setReportedUsers(data.content || []);
        setTotalPages(data.totalPages || 0);
    };

    const fetchUsers = async (status = '', page = 0) => {
        let params = `/api/admin/users?page=${page}&size=${ITEMS_PER_PAGE}`;
        if (status) params += `&status=${status}`;

        const data = await getUserListByAdmin(params);
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 0);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setExpandedUserId(null);
        setExpandedAdId(null);
    };

    const toggleUserDetails = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setExpandedUserId(userId);
        }
    };

    const toggleAdDetails = (adId) => {
        if (expandedAdId === adId) {
            setExpandedAdId(null);
        } else {
            setExpandedAdId(adId);
        }
    };

    const handleBanDaysChange = (userId, days) => {
        setBanDays((prev) => ({ ...prev, [userId]: days }));
    };

    const updateUserStatus = async (userId, newStatus) => {
        const days = banDays[userId] || 0;
        const params = `/${userId}/status?status=${newStatus}&banDays=${days}`;
        try {
            const result = await patchUserStateByAdmin(params);
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

    const handleAdFormChange = (e) => {
        const { name, value } = e.target;
        setAdForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdImageChange = (e) => {
        setAdImage(e.target.files[0]);
    };

    const handleAdSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('advertiser', adForm.advertiser);
        formData.append('title', adForm.title);
        formData.append('startDate', adForm.startDate);
        formData.append('endDate', adForm.endDate);
        if (adImage) {
            formData.append('image', adImage);
        }

        try {
            const result = await postAdNewByAdmin({formData});
            if (result.status === 'success') {
                alert('광고가 성공적으로 등록되었습니다.');
                setAdForm({ advertiser: '', title: '', startDate: '', endDate: '' });
                setAdImage(null);
            } else {
                console.error('광고 등록 실패:', result.message);
            }
        } catch (error) {
            console.error('광고 등록 중 오류가 발생했습니다:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => (
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
    );

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

            {activeTab === '신고확인' && (
                <div>
                    <h3>신고된 유저 목록</h3>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>신고 횟수</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reportedUsers.map((user) => (
                            <React.Fragment key={user.userId}>
                                <tr onClick={() => toggleUserDetails(user.userId)}>
                                    <td>{user.userId}</td>
                                    <td>{user.email}</td>
                                    <td>{user.reportCount}</td>
                                </tr>
                                {expandedUserId === user.userId && (
                                    <tr>
                                        <td colSpan="3">
                                            {user.reports.map((report, index) => (
                                                <div key={index}>
                                                    <p><strong>카테고리:</strong> {report.category}</p>
                                                    <p><strong>이유:</strong> {report.reason}</p>
                                                    <p><strong>상세 내용:</strong> {report.detailedReason}</p>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                    {renderPagination()}
                </div>
            )}

            {activeTab === '광고게시' && (
                <div>
                    <h3>광고 리스트</h3>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>광고주</th>
                            <th>제목</th>
                            <th>기간</th>
                        </tr>
                        </thead>
                        <tbody>
                        {adData.map((ad) => (
                            <React.Fragment key={ad.adId}>
                                <tr onClick={() => toggleAdDetails(ad.adId)}>
                                    <td>{ad.advertiser}</td>
                                    <td>{ad.title}</td>
                                    <td>{`${ad.startDate} ~ ${ad.endDate}`}</td>
                                </tr>
                                {expandedAdId === ad.adId && (
                                    <tr>
                                        <td colSpan="3">
                                            <p><strong>상세 설명:</strong> {ad.description}</p>
                                            <p><strong>이미지:</strong> <img src={ad.imageUrl} alt="광고 이미지" /></p>
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
                <div>
                    <h3>새 광고 등록</h3>
                    <form onSubmit={handleAdSubmit}>
                        <label>
                            광고주:
                            <input type="text" name="advertiser" value={adForm.advertiser} onChange={handleAdFormChange} required />
                        </label>
                        <label>
                            광고 제목:
                            <input type="text" name="title" value={adForm.title} onChange={handleAdFormChange} required />
                        </label>
                        <label>
                            시작 날짜:
                            <input type="date" name="startDate" value={adForm.startDate} onChange={handleAdFormChange} required />
                        </label>
                        <label>
                            종료 날짜:
                            <input type="date" name="endDate" value={adForm.endDate} onChange={handleAdFormChange} required />
                        </label>
                        <label>
                            이미지 업로드:
                            <input type="file" name="image" onChange={handleAdImageChange} accept="image/*" />
                        </label>
                        <button type="submit">등록</button>
                    </form>
                </div>
            )}

            {activeTab === '유저관리' && (
                <div>
                    <div className="filter">
                        <label>
                            상태 필터:
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">전체</option>
                                <option value="ACTIVE">ACTIVE</option>
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
                            <th>밴 설정</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.name}</td>
                                <td>{user.status}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="일수 입력"
                                        value={banDays[user.userId] || ''}
                                        onChange={(e) => handleBanDaysChange(user.userId, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => updateUserStatus(user.userId, 'BANNED')}>밴</button>
                                    <button onClick={() => updateUserStatus(user.userId, 'ACTIVE')}>활성화</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {renderPagination()}
                </div>
            )}
        </div>
    );
}

export default AdminPage;
