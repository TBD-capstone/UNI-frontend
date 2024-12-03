import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next'; // i18n 추가
import './mainpage.css';

const categories = [
    { icon: './icons/travel-guide.png', label: 'trip' },
    { icon: './icons/property.png', label: 'administration' },
    { icon: './icons/language-exchange.png', label: 'language' },
    { icon: './icons/find-room.png', label: 'college_life' },
    { icon: './icons/category5.png', label: 'gastroventure' },
    { icon: './icons/game.png', label: 'game' },
    { icon: './icons/realty.png', label: 'realty' },
    { icon: './icons/banking.png', label: 'banking' },
    { icon: './icons/mobile.png', label: 'mobile' },
    { icon: './icons/shopping.png', label: 'shopping' }
];

const ITEMS_PER_PAGE = 10;

const ProfileGrid = () => {
    const { t } = useTranslation(); // i18n 훅 사용
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ads, setAds] = useState([]);
    const [currentAd, setCurrentAd] = useState(null);
    const [language, setLanguage] = useState(Cookies.get('language') || 'en');
    const [sortOrder, setSortOrder] = useState('highest_rating'); // 기본값은 높은 별점 순

    const fetchWithLanguage = async (url, options = {}) => {
        const headers = {
            ...options.headers,
            'Accept-Language': language,
        };
        const response = await fetch(url, { ...options, headers });
        return response.json();
    };

    const fetchProfiles = async () => {
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage - 1); // 페이지 번호 유지
            params.append('sort', sortOrder); // 백엔드로 정렬 옵션 전달

            // 대학교 이름과 해시태그를 URL 파라미터에 맞게 추가
            const univNameRegex = /^[A-Za-z가-힣\s]+$/; // 대학교 이름이 입력되었는지 확인
            const hashtagRegex = /^#/; // 해시태그인지 확인

            if (searchQuery) {
                if (univNameRegex.test(searchQuery)) {
                    params.append('univName', searchQuery.trim()); // 대학교 이름 추가
                } else if (hashtagRegex.test(searchQuery)) {
                    const hashtags = searchQuery
                        .split(',')
                        .map(tag => tag.trim().replace('#', ''))
                        .join(',');
                    params.append('hashtags', hashtags); // 해시태그 추가
                }
            }

            const url = `http://localhost:8080/api/home?${params.toString()}`;
            const data = await fetchWithLanguage(url);

            // API 명세에 맞게 데이터 처리
            setProfiles(data.content || []);
            setFilteredProfiles(data.content || []);
        } catch (error) {
            console.error(t('mainpage.fetch_profiles_error'), error);
        }
    };

    const fetchAds = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/ads');
            const adData = await response.json();
            const activeAds = adData.filter(ad => ad.status === t('mainpage.active_ad_status'));

            setAds(activeAds);
            if (activeAds.length > 0) {
                setCurrentAd(activeAds[0]);
            }
        } catch (error) {
            console.error(t('mainpage.fetch_ads_error'), error);
        }
    };

    useEffect(() => {
        fetchAds();
        fetchProfiles(); // 메인 페이지 로드 시 자동으로 검색 실행
    }, [language, t, currentPage, sortOrder, searchQuery]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProfiles = filteredProfiles.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCategoryClick = (label) => {
        const categoryHashtag = `#${t(`mainpage.categories.${label}`)}`;
        if (selectedCategory === label) {
            setSelectedCategory(null);
            setSearchQuery(''); // 검색창 비우기
        } else {
            setSelectedCategory(label);
            setSearchQuery(categoryHashtag); // 카테고리 선택 시 해시태그를 검색창에 입력
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value); // 정렬 옵션 업데이트
    };

    const handleSearch = () => {
        // 검색 버튼을 눌렀을 때만 검색 실행
        fetchProfiles();
    };

    return (
        <div className="container">
            {currentAd && (
                <div className="ad-banner">
                    <img src={currentAd.imageUrl} alt={t('mainpage.ad_banner_alt')} />
                </div>
            )}

            <div className="header">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder={t('mainpage.search_placeholder')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button onClick={handleSearch}>{t('mainpage.search_button')}</button>
                    <select onChange={handleSortChange} value={sortOrder}>
                        <option value="newest">{t('mainpage.newest')}</option>
                        <option value="highest_rating">{t('mainpage.highest_rating')}</option>
                        <option value="lowest_rating">{t('mainpage.lowest_rating')}</option>
                    </select>
                </div>
            </div>

            <div className="filter-buttons">
                {categories.map((category, index) => (
                    <button
                        className={`filter-button ${selectedCategory === category.label ? 'active' : ''}`}
                        key={index}
                        onClick={() => handleCategoryClick(category.label)}
                    >
                        {t(`mainpage.categories.${category.label}`)}
                    </button>
                ))}
            </div>

            <div className="profile-grid">
                {currentProfiles.length > 0 ? (
                    currentProfiles.map((user, index) => (
                        <Link to={`/user/${user.userId}`} key={index} className="profile-card" style={{ textDecoration: 'none', color: 'black' }}>
                            <img src={user.imgProf || '/path/to/default-image.jpg'} alt={t('mainpage.profile_alt')} />
                            <div className="Profile-name">{user.username}</div>
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
                    ))
                ) : (
                    <div className="no-profiles">{t('mainpage.no_profiles')}</div>
                )}
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
