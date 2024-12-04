import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './navbar.css';

import languageIcon from './language-icon.png'; // 언어 아이콘 이미지 경로
import { useTranslation } from "react-i18next";
import i18n from "i18next";

function Navbar({ selectedLanguage, fetchWithLanguage }) {
    const { t } = useTranslation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const navigate = useNavigate();
    const menuRef = useRef(null);


    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await fetch('/api/user/me');
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.userId);
                    setUsername(data.name);
                    setProfileImage(data.imgProf || '/default-image.jpg');
                } else {
                    console.error('Failed to fetch profile image');
                }
            } catch (error) {
                console.error('Error fetching profile image:', error);
            }
        };

        fetchProfileImage();
    }, []);

    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    const handleLogout = () => {
        document.cookie = 'userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setMenuOpen(false);
        navigate('/login');
    };

    const toggleLanguageMenu = () => {
        setLanguageMenuOpen((prevState) => !prevState);
    };

    const handleLanguageChange = (newLanguage) => {
        Cookies.set('language', newLanguage, { path: '/' });
        i18n.changeLanguage(newLanguage);
        window.location.reload();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="navbar">
            <div className="logo-section" onClick={() => navigate('/main')}>
                <img src="/UNI_Logo.png" alt="UNI Logo" className="uni-logo" />
            </div>
            <div className="menu-icons">
                <div className="language-icon-container">
                    <img
                        src={languageIcon}
                        alt="언어 변경"
                        className="language-icon"
                        onClick={toggleLanguageMenu}
                    />
                    {languageMenuOpen && (
                        <div className="language-dropdown">
                            <ul>
                                <li onClick={() => handleLanguageChange('ko')}>한국어</li>
                                <li onClick={() => handleLanguageChange('en')}>English</li>
                                <li onClick={() => handleLanguageChange('zh')}>中文</li>
                            </ul>
                        </div>
                    )}
                </div>
                <div className="user">
                    <img
                        src={profileImage}
                        alt="프로필"
                        className="profile-image"
                        onClick={() => navigate(`/user/${userId}`)} // 프로필 이미지 클릭 시 이동
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <div className="userid">
                    <Link to={`/user/${userId}`} className="username-link" style={{ textDecoration: 'none' }}>
                        <span className="username">{username || 'Guest'}</span>
                    </Link>
                </div>
                <div className="hamburger" onClick={toggleMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </div>
            </div>
            {menuOpen && (
                <div className="dropdown-menu" ref={menuRef}>
                    <ul>
                        <li>
                            <Link
                                to="/matching-list"
                                onClick={() => setMenuOpen(false)}
                                className="menu-item"
                            >
                                {t("navbar.menu.matching_list")}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/chat-list"
                                onClick={() => setMenuOpen(false)}
                                className="menu-item"
                            >
                                {t("navbar.menu.chat_list")}
                            </Link>
                        </li>
                        <li
                            onClick={handleLogout}
                            className="menu-item logout-button"
                        >
                            {t("navbar.menu.logout")}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar;
