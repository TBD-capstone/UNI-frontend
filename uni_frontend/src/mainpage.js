import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ads, setAds] = useState([]);
    const [currentAd, setCurrentAd] = useState(null);
    const [language] = useState(Cookies.get('language') || 'en');
    const [sortOrder, setSortOrder] = useState('highest_rating');
    const [isLoading, setIsLoading] = useState(false);
    const [isProfilesEmpty, setIsProfilesEmpty] = useState(false);

    const fetchWithLanguage = async (url, options = {}) => {
        const headers = {
            ...(options.headers || {}),
            'Accept-Language': language,
        };
        const response = await fetch(url, { ...options, headers });
        return response.json();
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch profiles
            const params = new URLSearchParams();
            params.append('page', currentPage - 1);
            params.append('sort', sortOrder);

            const univNameRegex = /^[A-Za-z가-힣\s]+$/;
            const hashtagRegex = /^#/;
            if (searchQuery) {
                if (univNameRegex.test(searchQuery.trim())) {
                    params.append('univName', searchQuery.trim());
                } else if (hashtagRegex.test(searchQuery.trim())) {
                    const hashtags = searchQuery
                        .split(',')
                        .map(tag => tag.trim().replace('#', ''))
                        .join(',');
                    params.append('hashtags', hashtags);
                }
            }

            const profileUrl = `/api/home?${params.toString()}`;
            const profileData = await fetchWithLanguage(profileUrl);

            const fetchedProfiles = profileData.content || [];
            setProfiles(fetchedProfiles);
            setFilteredProfiles(fetchedProfiles);
            setIsProfilesEmpty(fetchedProfiles.length === 0);

            // Fetch ads
            const adsResponse = await fetch('/api/ads');
            const adData = await adsResponse.json();
            const activeAds = adData.filter(ad => ad.status === t('mainpage.active_ad_status'));

            setAds(activeAds);
            setCurrentAd(activeAds.length > 0 ? activeAds[0] : null);
        } catch (error) {
            console.error(t('mainpage.fetch_error'), error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [language, t, currentPage, sortOrder, searchQuery]);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleCategoryClick = (label) => {
        const categoryHashtag = `#${t(`mainpage.categories.${label}`)}`;
        if (selectedCategory === label) {
            setSelectedCategory(null);
            setSearchQuery('');
        } else {
            setSelectedCategory(label);
            setSearchQuery(categoryHashtag);
        }
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    const handleSortChange = (e) => setSortOrder(e.target.value);

    const handleSearch = () => fetchData();

    const currentProfiles = filteredProfiles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);

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
                {categories.map((category) => (
                    <button
                        className={`filter-button ${selectedCategory === category.label ? 'active' : ''}`}
                        key={category.label}
                        onClick={() => handleCategoryClick(category.label)}
                    >
                        {t(`mainpage.categories.${category.label}`)}
                    </button>
                ))}
            </div>

            <div className="profile-grid">
                {isLoading ? (
                    <div className="loading-message">{t('mainpage.loading')}</div>
                ) : isProfilesEmpty ? (
                    <div className="no-profiles">{t('mainpage.no_profiles')}</div>
                ) : (
                    currentProfiles.map((user) => (
                        <Link to={`/user/${user.userId}`} key={user.userId} className="profile-card">
                            <img src={user.imgProf || '/path/to/default-image.jpg'} alt={t('mainpage.profile_alt')} />
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
                    ))
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
