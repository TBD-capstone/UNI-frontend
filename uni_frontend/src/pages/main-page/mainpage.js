import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import './mainpage.css';
import Select from "react-select";
import {getAd, getSearch} from "../../api/homeAxios";


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
    const [searchQuery, setSearchQuery] = useState(''); // 검색창 값
    const [hashtags, setHashtags] = useState([]); // 선택된 해시태그 상태
    const [ads, setAds] = useState([]);
    const [currentAd, setCurrentAd] = useState(null);
    const [language] = useState(Cookies.get('language') || 'en');
    const [sortOrder, setSortOrder] = useState('highest_rating');
    const [isLoading, setIsLoading] = useState(false);
    const [isProfilesEmpty, setIsProfilesEmpty] = useState(false);
    const [totalPages, setTotalPages] = useState(1); // 페이지 수 상태 추가
    const [univList, setUnivList] = useState([]); // 대학 리스트 상태
    const [selectedUniversity, setSelectedUniversity] = useState(''); // 선택된 대학 상태


    // const fetchWithLanguage = async (url, options = {}) => {
    //     const headers = {
    //         ...(options.headers || {}),
    //         'Accept-Language': language,
    //     };
    //     const response = await fetch(url, { ...options, headers });
    //     return response.json();
    // };

    const fetchAds = async () => {
        try {
            const data = await getAd();
            const activeAds = (data.ads || []).filter(ad => ad.adStatus === 'ACTIVE'); // "ACTIVE" 상태만 필터링
            setAds(activeAds);
        } catch (error) {
            console.error('광고 데이터 가져오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchAds(); // 광고 데이터 가져오기
    }, []);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage - 1); // 0-based page index
            params.append('size', ITEMS_PER_PAGE); // 페이지 크기 설정
            params.append('sort', sortOrder);

            if (hashtags.length > 0) {
                params.append('hashtags', hashtags.join(','));
            }
            if (selectedUniversity) {
                params.append('univName', selectedUniversity); // 대학 필터 추가 (univName 사용)
            }
            const profileParams = `${params.toString()}`;
            console.log(profileParams);

            const profileData = await getSearch(profileParams);


            // const profileUrl = `/api/home?${params.toString()}`;
            // const profileData = await fetchWithLanguage(profileUrl);

            // API 응답 데이터 매핑
            const fetchedProfiles = profileData.content || [];
            setProfiles(fetchedProfiles); // 현재 페이지 데이터만 설정
            setFilteredProfiles(fetchedProfiles); // 같은 데이터를 filteredProfiles에 설정
            setTotalPages(profileData.totalPages || 1); // totalPages 값을 설정

            setIsProfilesEmpty(fetchedProfiles.length === 0);
        } catch (error) {
            console.error(t('mainpage.fetch_error'), error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const fetchUnivList = async () => {
            try {
                const response = await fetch(`/api/auth/univ`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();

                if (Array.isArray(data)) {
                    setUnivList(
                        data.map((university) => ({
                            value: university.univName, // react-select에 사용할 값
                            label: university.univName // react-select에 표시할 라벨
                        }))
                    );
                } else {
                    console.error("대학 리스트를 가져오지 못했습니다.");
                }
            } catch (error) {
                console.error("대학 리스트를 가져오는 중 오류가 발생했습니다:", error);
            }
        };

        fetchUnivList();
    }, []);


    useEffect(() => {
        fetchData();
    }, [language, t, currentPage, sortOrder, hashtags]);

    const handlePageChange = (page) => {
        setCurrentPage(page); // 페이지 상태 업데이트
    };

    const handleCategoryClick = (label) => {
        const categoryHashtag = t(`mainpage.categories.${label}`);
        if (hashtags.includes(categoryHashtag)) {
            // 해시태그 제거
            setHashtags(hashtags.filter((tag) => tag !== categoryHashtag));
        } else {
            // 해시태그 추가
            setHashtags([...hashtags, categoryHashtag]);
        }
    };


    const handleSearchInputChange = (e) => {
        const input = e.target.value;
        setSearchQuery(input); // 검색창 값 업데이트

        const inputHashtags = input
            .split(' ')
            .map(tag => tag.trim().replace('#', ''))
            .filter(tag => tag !== '');
        setHashtags(Array.from(new Set(inputHashtags))); // 중복 제거 후 업데이트
    };

    const handleSearch = () => {
        fetchData(); // 검색 실행
    };

    const handleSortChange = (e) => setSortOrder(e.target.value);

    const currentProfiles = filteredProfiles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="container">
            <div className="ads-section">
                {ads.length > 0 ? (
                    ads.map((ad) => (
                        <div key={ad.adId} className="ad-card">
                            <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
                            <div className="ad-details">
                                <h4>{ad.title}</h4>
                                <p>{ad.advertiser}</p>
                                <p>{`${ad.startDate} ~ ${ad.endDate}`}</p>
                                <p>{`Status: ${ad.adStatus}`}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <img src= '/default-ad-image.png' alt= "광고가 없습니다" className="default-ad-image"/>
                )}
            </div>

            <div className="header">
                <div className="search-bar">
                    <Select
                        className="university-dropdown"
                        options={univList} // 대학 리스트
                        onChange={(selectedOption) => setSelectedUniversity(selectedOption?.value || '')} // 값 선택 핸들러
                        placeholder={t('대학교 선택')} // 기본 안내 문구
                        isSearchable // 검색 가능 여부 추가
                        isClearable // 선택 취소 가능하도록 추가
                    />
                    <input
                        type="text"
                        placeholder={t('mainpage.search_placeholder')}
                        value={searchQuery}
                        onChange={handleSearchInputChange} // 검색창에서 값 입력 가능
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
                        key={category.label}
                        className={`filter-button ${hashtags.includes(t(`mainpage.categories.${category.label}`)) ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category.label)}
                    >
                        {t(`mainpage.categories.${category.label}`)}
                    </button>
                ))}
            </div>

            <div className="profile-grid">
                {isLoading ? (
                    <div className="loading-message">{t('')}</div>
                ) : isProfilesEmpty ? (
                    <div className="no-profiles">{t('')}</div>
                ) : (
                    currentProfiles.map((user) => (
                        <Link to={`/user/${user.userId}`} key={user.userId} className="profile-card">
                            <img src={user.imgProf || '/profile-image.png'} alt={t('mainpage.profile_alt')} />
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
