import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './mainpage.css';

const categories = [
    { icon: './icons/travel-guide.png', label: '여행가이드' },
    { icon: './icons/property.png', label: '부동산행정업무' },
    { icon: './icons/language-exchange.png', label: '언어교환' },
    { icon: './icons/find-room.png', label: '자취방 구하기' },
    { icon: './icons/category5.png', label: '맛집 탐방' },
];

const ITEMS_PER_PAGE = 8;

const ProfileGrid = () => {
    const [profiles, setProfiles] = useState([]); // 프로필 데이터를 저장할 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 카테고리 상태

    // 데이터베이스에서 프로필 데이터를 가져오기 위한 useEffect
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const response = await fetch('/api/profiles'); // 프로필 데이터를 가져올 API 엔드포인트
                const data = await response.json();
                setProfiles(data); // 데이터를 상태에 저장
            } catch (error) {
                console.error('프로필 데이터를 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchProfiles();
    }, []); // 첫 번째 렌더링 시에만 실행

    // 선택된 카테고리와 일치하는 프로필 필터링
    const filteredProfiles = selectedCategory
        ? profiles.filter(profile => profile.tags && profile.tags.includes(selectedCategory))
        : profiles;

    // 현재 페이지에서 보여줄 프로필의 시작과 끝 인덱스 계산
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 카테고리 클릭 핸들러
    const handleCategoryClick = (label) => {
        setSelectedCategory(label === selectedCategory ? null : label); // 동일 카테고리 클릭 시 필터 해제
        setCurrentPage(1); // 페이지를 첫 페이지로 리셋
    };

    return (
        <div className="container">
            {/* 광고 배너 */}
            <div className="ad-banner">
                <img src="./ads/banner.png" alt="광고 배너" />
            </div>

            {/* 헤더 */}
            <div className="header">
                <img src="./UNI_Logo.png" alt="Logo" />
                {/* 검색창 */}
                <div className="search-bar">
                    <input type="text" placeholder="국가별 검색, 등록비별 검색, 해시태그로 검색" />
                    <button>검색</button>
                </div>

                <div className="dropdown">
                    <button>로그인</button>
                    <div className="dropdown-content">
                        <Link to="/register">회원가입</Link>
                        <Link to="/login">로그인</Link>
                    </div>
                </div>
            </div>

            {/* 카테고리 아이콘 */}
            <div className="category">
                {categories.map((category, index) => (
                    <div
                        className={`category-item ${selectedCategory === category.label ? 'active' : ''}`}
                        key={index}
                        onClick={() => handleCategoryClick(category.label)}
                    >
                        <img src={category.icon} alt="" /> {/* alt 속성을 빈 문자열로 설정 */}
                        <span>{category.label}</span>
                    </div>
                ))}
            </div>

            {/* 프로필 카드 */}
            <div className="profile-grid">
                {currentProfiles.map((profile, index) => (
                    <div className="profile-card" key={index}>
                        <img src={profile.image || '/path/to/default-image.jpg'} alt="Profile" />
                        <div className="profile-name">{profile.name}</div>
                        <div className="profile-university">{profile.university}</div>
                        <div className="rating">
                            <span className="star">⭐</span>
                            <span>{profile.rating}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이지네이션 */}
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
};

export default ProfileGrid;
