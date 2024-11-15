import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './mainpage.css';

const categories = [
    { icon: './icons/travel-guide.png', label: '여행' },
    { icon: './icons/property.png', label: '행정' },
    { icon: './icons/language-exchange.png', label: '언어' },
    { icon: './icons/find-room.png', label: '대학생활' },
    { icon: './icons/category5.png', label: '맛집 탐방' },
];

const ITEMS_PER_PAGE = 8;
const DEFAULT_LANGUAGE_ID = 'ko'; // 기본 언어 ID를 'ko'로 설정

const ProfileGrid = () => {
    const [profiles, setProfiles] = useState([]); // 전체 프로필 데이터를 저장할 상태
    const [profileString, setProfileString] = useState(''); // profileString을 저장할 상태
    const [filteredProfiles, setFilteredProfiles] = useState([]); // 필터링된 프로필 데이터를 저장할 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 카테고리 상태
    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태

    // API에서 프로필 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                console.log("hihi3");
                const response = await fetch(`http://localhost:8080/api/home`); // lang_id를 사용하여 프로필 데이터 가져오기
                const data = await response.json();
                setProfileString("dummy data");
                console.log(data);
                setProfiles(data.data); // API로부터 받아온 프로필 데이터를 상태에 저장
                setFilteredProfiles(data.data); // 초기 상태에서는 전체 프로필을 필터링된 프로필로 설정
            } catch (error) {
                console.error('프로필 데이터를 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchProfiles();
    }, []); // 첫 번째 렌더링 시에만 실행

    // 선택된 카테고리와 검색어로 프로필 필터링
    useEffect(() => {
        const filterProfiles = () => {
            let filtered = profiles;

            // 카테고리 필터링
            if (selectedCategory) {
                filtered = filtered.filter(profile =>
                    profile.hashtags && profile.hashtags.includes(selectedCategory)
                );
            }

            // 검색어 필터링
            if (searchQuery) {
                filtered = filtered.filter(profile =>
                    profile.hashtags && profile.hashtags.includes(searchQuery)
                );
            }

            setFilteredProfiles(filtered);
            setCurrentPage(1); // 필터링이 변경되면 페이지를 첫 페이지로 리셋
        };

        filterProfiles();
    }, [selectedCategory, searchQuery, profiles]); // selectedCategory, searchQuery, profiles 변경 시 필터링 실행

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
    };

    // 검색어 입력 핸들러
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
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
                    <input
                        type="text"
                        placeholder="해시태그로 검색"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
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
                        <img src={category.icon} alt="" />
                        <span>{category.label}</span>
                    </div>
                ))}
            </div>

            {/* 프로필 카드 */}
            <div className="profile-grid">
                {currentProfiles.map((user, index) => (
                    <Link to={`/user/${user.userId}`} key={index} className="profile-card">
                        <img src={user.imgProf || '/path/to/default-image.jpg'} alt="Profile" />
                        <div className="profile-name">{user.username}</div>
                        <div className="profile-university">{user.univName}</div>
                        <div className="rating">
                            <span className="star">⭐</span>
                            <span>{user.star}</span>
                        </div>
                    </Link>
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
