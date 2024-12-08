import React, { useState, useEffect } from 'react';
import './admin.css';
import { useNavigate } from 'react-router-dom';
import Modal from "../../components/modal/Modal";
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
    const [selectedReportedUser, setSelectedReportedUser] = useState(null); // 선택된 신고 유저


    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = true;
        if (!isAdmin) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                if (activeTab === '광고게시') {
                    const data = await getAdListByAdmin();
                    if (isMounted) setAdData(data.ads || []);
                } else if (activeTab === '신고확인') {
                    const data = await getReportedUserListByAdmin(`page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`);
                    if (isMounted) {
                        setReportedUsers(data.content || []);
                        setTotalPages(data.totalPages || 0);
                    }
                } else if (activeTab === '유저관리') {
                    const data = await getUserListByAdmin(`page=${currentPage - 1}&size=${ITEMS_PER_PAGE}&status=${statusFilter}`);
                    if (isMounted) {
                        setUsers(data.content || []);
                        setTotalPages(data.totalPages || 0);
                    }
                }
            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [activeTab, statusFilter, currentPage]);

    const fetchReportedUsers = async (page = 0) => {
        try {
            const data = await getReportedUserListByAdmin(`page=${page}&size=${ITEMS_PER_PAGE}`);
            setReportedUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('fetchReportedUsers 실패:', error);
            setReportedUsers([]); // 기본값으로 설정
        }
    };

    const fetchUsers = async (status = '', page = 0) => {
        try {
            const params = `page=${page}&size=${ITEMS_PER_PAGE}${status ? `&status=${status}` : ''}`;
            const data = await getUserListByAdmin(params);
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('fetchUsers 실패:', error);
            setUsers([]); // 기본값으로 설정
        }
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

    const handleReportClick = (user) => {
        const reportDetails = user.reports[0]; // 첫 번째 신고 정보 가져오기
        setSelectedReportedUser({
            ...user,
            title: reportDetails.title,
            category: reportDetails.category,
            detailedReason: reportDetails.detailedReason,
        });
    };


    const handleCloseModal = () => {
        setSelectedReportedUser(null); // 모달 닫기
    };

    const handleBanUser = () => {
        if (selectedReportedUser) {
            updateUserStatus(selectedReportedUser.userId, 'BANNED');
            handleCloseModal(); // 모달 닫기
        }
    };


    const toggleAdDetails = (adId) => {
        if (expandedAdId === adId) {
            setExpandedAdId(null);
        } else {
            setExpandedAdId(adId);
        }
    };
    const toggleAdStatus = async (adId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            const result = await patchUserStateByAdmin({
                adId,
                newStatus,
            }); // axios 함수 호출
            if (result.message) {
                alert(result.message);
                setAdData((prevAdData) =>
                    prevAdData.map((ad) =>
                        ad.adId === adId ? { ...ad, adStatus: newStatus } : ad
                    )
                );
            }
        } catch (error) {
            console.error('toggleAdStatus 실패:', error);
        }
    };



    const handleBanDaysChange = (userId, days) => {
        setBanDays((prev) => ({ ...prev, [userId]: days }));
    };

    const updateUserStatus = async (userId, newStatus) => {
        const days = banDays[userId] || 0;
        const params = `${userId}/status?status=${newStatus}&banDays=${days}`;

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

        try {
            const formData = new FormData();
            formData.append('advertiser', adForm.advertiser);
            formData.append('title', adForm.title);
            formData.append('startDate', adForm.startDate);
            formData.append('endDate', adForm.endDate);
            formData.append('adStatus', adForm.adStatus || 'ACTIVE');

            if (adImage) {
                formData.append('image', adImage);
            }

            const result = await postAdNewByAdmin(formData);

            if (result.status === 'success') {
                alert('광고가 성공적으로 등록되었습니다.');
                setAdForm({ advertiser: '', title: '', startDate: '', endDate: '' });
                setAdImage(null);
            } else {
                console.error('광고 등록 실패:', result.message);
            }
        } catch (error) {
            console.error('광고 등록 중 오류가 발생했습니다:', error);
            alert('광고 등록 실패. 다시 시도하세요.');
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
                            <tr key={user.userId} onClick={() => handleReportClick(user)}>
                                <td>{user.userId}</td>
                                <td>{user.email}</td>
                                <td>{user.reportCount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {renderPagination()}

                    {selectedReportedUser && (
                        <Modal isOpen={!!selectedReportedUser} handleClose={handleCloseModal}>
                            <div>
                                <h4>신고 상세 정보</h4>
                                <p><strong>ID:</strong> {selectedReportedUser.userId}</p>
                                <p><strong>Email:</strong> {selectedReportedUser.email}</p>
                                <p><strong>제목:</strong> {selectedReportedUser.title}</p>
                                <p><strong>카테고리:</strong> {selectedReportedUser.category}</p>
                                <p><strong>상세 사유:</strong> {selectedReportedUser.detailedReason}</p>
                                <label>
                                    밴 일수:
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="일수를 입력하세요"
                                        value={banDays[selectedReportedUser.userId] || ''}
                                        onChange={(e) => handleBanDaysChange(selectedReportedUser.userId, e.target.value)}
                                    />
                                </label>
                                <button onClick={handleBanUser}>밴 처리</button>
                            </div>
                        </Modal>
                    )}

                </div>
            )}

            {activeTab === '광고게시' && (
                <div>
                    <h3>광고 리스트</h3>
                    <div className="action-buttons">
                        <button onClick={() => handleTabClick('광고등록')} className="btn-primary">
                            광고 등록하기
                        </button>
                        <button onClick={() => fetchReportedUsers()} className="btn-secondary">
                            새로고침
                        </button>
                    </div>
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
                                            <label>
                                                광고 상태:
                                                <select
                                                    name="adStatus"
                                                    value={adForm.adStatus || 'ACTIVE'}
                                                    onChange={handleAdFormChange}
                                                >
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                    <option value="ENDED">ENDED</option>
                                                </select>
                                            </label>
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
