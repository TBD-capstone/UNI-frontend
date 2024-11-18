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
];

// 다국어 번역 텍스트
const translations = {
    en: {
        trip: 'Trip',
        administration: 'Administration',
        realty: 'Realty',
        banking: 'Banking',
        mobile: 'Mobile',
        'language exchange': 'Language Exchange',
        'college life': 'College Life',
        gastroventure: 'Gastroventure',
        game: 'Game',
        shopping: 'Shopping',
        searchPlaceholder: 'Search by hashtag',
        searchButton: 'Search',
        bannerAlt: 'Advertisement Banner',
        noProfiles: 'No profiles available.',
    },
    ko: {
        trip: '여행',
        administration: '행정',
        realty: '부동산',
        banking: '은행',
        mobile: '휴대폰',
        'language exchange': '언어교환',
        'college life': '대학생활',
        gastroventure: '맛집 탐방',
        game: '게임',
        shopping: '쇼핑',
        searchPlaceholder: '해시태그로 검색',
        searchButton: '검색',
        bannerAlt: '광고 배너',
        noProfiles: '등록된 프로필이 없습니다.',
    },
    zh: {
        trip: '旅行',
        administration: '行政',
        realty: '房地产',
        banking: '银行',
        mobile: '通讯',
        'language exchange': '语言交换',
        'college life': '大学生活',
        gastroventure: '美食游',
        game: '游戏',
        shopping: '购物',
        searchPlaceholder: '通过标签搜索',
        searchButton: '搜索',
        bannerAlt: '广告横幅',
        noProfiles: '暂无可用个人资料。',
    }
};


const ITEMS_PER_PAGE = 8;

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

    /*const t = translations[language]; // 번역 텍스트 가져오기*/

    const fetchWithLanguage = async (url, options = {}) => {
        const headers = {
            ...options.headers,
            'Accept-Language': language,
        };
        const response = await fetch(url, { ...options, headers });
        return response.json();
    };

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const data = await fetchWithLanguage('http://localhost:8080/api/home');
                setProfiles(data.data || []);
                setFilteredProfiles(data.data || []);
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

        fetchProfiles();
        fetchAds();
    }, [language]);

    useEffect(() => {
        const filterProfiles = () => {
            let filtered = profiles;

            if (selectedCategory) {
                filtered = filtered.filter(profile =>
                    profile.hashtags && profile.hashtags.includes(t(`mainpage.categories.${selectedCategory}`))
                );
            }

            if (searchQuery) {


                const translatedQuery = searchQuery;

                filtered = filtered.filter(profile =>
                    profile.hashtags && profile.hashtags.some(tag => tag.includes(searchQuery))
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

                    <img src={currentAd.imageUrl} alt={t('mainpage.ad_banner_alt')} />                    

                </div>
            )}

            <div className="header">
                <img src="UNI_Logo.png" alt={t('mainpage.logo_alt')} />

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder={t('mainpage.search_placeholder')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button>{t('mainpage.search_button')}</button>                    

                </div>
            </div>

            <div className="category">
                {categories.map((category, index) => (
                    <div
                        className={`category-item ${selectedCategory === category.label ? 'active' : ''}`}
                        key={index}
                        onClick={() => handleCategoryClick(category.label)}
                    >
                        <span>{t(`mainpage.categories.${category.label}`)}</span>                     

                    </div>
                ))}
            </div>

            <div className="profile-grid">               

                {currentProfiles.length > 0 ? (
                    currentProfiles.map((user, index) => (
                        <Link to={`/user/${user.userId}`} key={index} className="profile-card">
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
                    <div className="no-profiles">{t.noProfiles}</div>
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
