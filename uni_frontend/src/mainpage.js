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
                    profile.hashtags && profile.hashtags.includes(`#${selectedCategory}`)
                );
            }

            if (searchQuery) {
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
        if (selectedCategory === label) {
            setSelectedCategory(null);
            setSearchQuery('');
        } else {
            setSelectedCategory(label);
            setSearchQuery(`#${t(`mainpage.categories.${label}`)}`);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // 검색창에서 입력이 지워지면 카테고리 선택 해제
        if (query === '') {
            setSelectedCategory(null);
        }
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
