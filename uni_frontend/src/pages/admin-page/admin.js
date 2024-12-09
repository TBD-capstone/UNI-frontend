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



const ITEMS_PER_PAGE = 10;

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
    // 신고 데이터를 전처리하여 단일 리스트로 반환
    const processReportedUsers = (data) => {
        const processedReports = [];

        data.forEach((user) => {
            user.reports.forEach((report) => {
                processedReports.push({
                    ...report,
                    email: user.email, // 신고된 유저의 이메일
                    userId: user.userId, // 신고된 유저의 ID
                });
            });
        });

        return processedReports;
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getReportedUserListByAdmin(
                    `page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`
                );

                if (response.content) {
                    const processedReports = processReportedUsers(response.content);
                    setReportedUsers(processedReports); // 전처리된 데이터를 상태로 저장
                }
            } catch (error) {
                console.error("데이터 가져오기 실패:", error);
            }
        };

        fetchData();
    }, [currentPage]);



    // 함수는 컴포넌트 함수 내부에 정의 (useEffect 외부로 이동)
    const fetchReportedUsers = async (page = 0) => {
        try {
            const data = await getReportedUserListByAdmin(`page=${page}&size=${ITEMS_PER_PAGE}`);
            // 개별 신고 데이터를 reportedUsers에 저장
            setReportedUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error("fetchReportedUsers 실패:", error);
            setReportedUsers([]);
        }
    };

    useEffect(() => {
        if (activeTab === "신고확인") {
            fetchReportedUsers(currentPage - 1);
        }
    }, [activeTab, currentPage]);

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

    const handleReportClick = (report) => {
        console.log("선택된 신고 데이터:", report); // 디버깅용 로그
        setSelectedReportedUser(report);
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
        const parsedDays = parseInt(days, 10);
        if (!isNaN(parsedDays) && parsedDays >= 0) {
            setBanDays((prev) => ({ ...prev, [userId]: parsedDays }));
        }
    };


    const updateUserStatus = async (userId, newStatus) => {
        const days = banDays[userId] || 0; // banDays 상태에서 값 가져오기

        try {
            const result = await patchUserStateByAdmin({
                userId,
                userStatus: newStatus,
                banDays: days,
            });


            alert("유저 상태가 업데이트 되었습니다");
            fetchUsers(statusFilter, currentPage - 1); // 유저 리스트 갱신

        } catch (error) {
            console.error('유저 상태 업데이트 중 에러:', error);
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

            // JSON 데이터를 별도로 생성
            const jsonPayload = {
                advertiser: adForm.advertiser,
                title: adForm.title,
                startDate: adForm.startDate,
                endDate: adForm.endDate,
                adStatus: adForm.adStatus || 'ACTIVE',
            };

            // JSON 객체 추가 (백엔드에서 파싱 기대)
            formData.append('adRequest', new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' }));

            // 파일 데이터 (image)
            if (adImage) {
                formData.append('adImg', adImage); // 파일 데이터 추가
            }

            // 서버로 전송
            const result = await postAdNewByAdmin(formData);

            if (result && result.adId) {
                alert('광고가 성공적으로 등록되었습니다.');
                // 폼 데이터 초기화
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
                    광고 상태 관리
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
                    <h3>신고 리스트</h3>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>신고일</th>
                            <th>제목</th>
                            <th>신고자</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reportedUsers.length > 0 ? (
                            reportedUsers.map((report, index) => (
                                <tr key={report.reportId} onClick={() => handleReportClick(report)}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {report.reportedAt
                                            ? new Date(report.reportedAt).toLocaleString()
                                            : "N/A"}
                                    </td>
                                    <td>{report.title || "제목 없음"}</td>
                                    <td>{report.reporterName || "신고자 없음"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">신고 데이터가 없습니다.</td>
                            </tr>
                        )}
                        </tbody>

                    </table>
                    {renderPagination()}

                    {selectedReportedUser && (
                        <Modal isOpen={!!selectedReportedUser} handleClose={handleCloseModal}>
                            <div>
                                <h4>신고 상세 정보</h4>
                                <p>
                                    <strong>신고 번호:</strong> {selectedReportedUser.reportId || "N/A"}
                                </p>
                                <p>
                                    <strong>피신고 대상:</strong>{" "}
                                    {selectedReportedUser.reportedUserName || "N/A"}
                                </p>
                                <p>
                                    <strong>신고자:</strong> {selectedReportedUser.reporterName || "N/A"}
                                </p>
                                <p>
                                    <strong>신고일:</strong>{" "}
                                    {selectedReportedUser.reportedAt
                                        ? new Date(selectedReportedUser.reportedAt).toLocaleString()
                                        : "N/A"}
                                </p>
                                <p>
                                    <strong>제목:</strong> {selectedReportedUser.title || "제목 없음"}
                                </p>
                                <p>
                                    <strong>카테고리:</strong> {selectedReportedUser.category || "없음"}
                                </p>
                                <p>
                                    <strong>신고 사유:</strong> {selectedReportedUser.reason || "없음"}
                                </p>
                                <p>
                                    <strong>상세 내용:</strong>{" "}
                                    {selectedReportedUser.detailedReason || "없음"}
                                </p><label>
                                    밴 일수:
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="일수를 입력하세요"
                                        value={banDays[selectedReportedUser.userId] || ""}
                                        onChange={(e) =>
                                            handleBanDaysChange(selectedReportedUser.userId, e.target.value)
                                        }
                                    />
                                </label>
                                <button onClick={() => updateUserStatus(selectedReportedUser.targetId, "BANNED")}>
                                    밴 처리
                                </button>
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
