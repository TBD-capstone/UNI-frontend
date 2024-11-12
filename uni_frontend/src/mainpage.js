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
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ads, setAds] = useState([]);
    const [currentAd, setCurrentAd] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/home');
                const data = await response.json();
                setProfiles(data.data);
                setFilteredProfiles(data.data);
            } catch (error) {
                console.error('프로필 데이터를 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        const fetchAds = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/ads');
                const adData = await response.json();
                const activeAds = adData.filter(ad => ad.status === '개시중');
                setAds(activeAds);
                if (activeAds.length > 0) {
                    setCurrentAd(activeAds[0]);
                }
            } catch (error) {
                console.error('광고 데이터를 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        // 로컬 스토리지에서 로그인 상태 확인
        const checkLoginStatus = () => {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setIsLoggedIn(true);
                setUsername(storedUsername);
            }
        };

        fetchProfiles();
        fetchAds();
        checkLoginStatus();
    }, []);

    useEffect(() => {
        const filterProfiles = () => {
            let filtered = profiles;

            if (selectedCategory) {
                filtered = filtered.filter(profile =>
                    profile.hashtags && profile.hashtags.includes(selectedCategory)
                );
            }

            if (searchQuery) {
                filtered = filtered.filter(profile =>
                    profile.hashtags && profile.hashtags.includes(searchQuery)
                );
            }

            setFilteredProfiles(filtered);
            setCurrentPage(1);
        };

        filterProfiles();
    }, [selectedCategory, searchQuery, profiles]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProfiles = filteredProfiles.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCategoryClick = (label) => {
        setSelectedCategory(label === selectedCategory ? null : label);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="container">
            {currentAd && (
                <div className="ad-banner">
                    <img src={currentAd.imageUrl} alt="광고 배너" />
                </div>
            )}

            <div className="header">
                <img src="./UNI_Logo.png" alt="Logo" />

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
                    {isLoggedIn ? (
                        <Link to="/profile" className="profile-link">
                            {username}님
                        </Link>
                    ) : (
                        <>
                            <button>로그인</button>
                            <div className="dropdown-content">
                                <Link to="/register">회원가입</Link>
                                <Link to="/login">로그인</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

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
                        <div className="profile-hashtags">
                            {user.hashtags && user.hashtags.map((tag, i) => (
                                <span key={i} className="hashtag">#{tag}</span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>

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
