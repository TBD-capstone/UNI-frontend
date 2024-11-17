import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './navbar.css';

import profileImage from './profile-image.png'; // 프로필 이미지 경로 설정
import languageIcon from './language-icon.png'; // 언어 아이콘 이미지 경로
import { useTranslation } from "react-i18next";
import i18n from "i18next";


    


function Navbar({ selectedLanguage, fetchWithLanguage }) {
    const { t } = useTranslation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const cookieUsername = Cookies.get('userName');
        if (cookieUsername) {
            setUsername(cookieUsername);
        }
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        document.cookie = 'userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'language=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login');
    };

    const toggleLanguageMenu = () => {
        setLanguageMenuOpen(!languageMenuOpen);
    };


    const handleLanguageChange = (newLanguage) => {
        Cookies.set('language', newLanguage, { path: '/' });
        i18n.changeLanguage(newLanguage); // 언어 변경 API 호출
        window.location.reload(); // 변경 후 전체 새로고침으로 언어 반영
    };

    return (
        <div className="navbar">
            <div className="logo" onClick={() => navigate('/main')}>
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
                <div className="profile">
                    <img src={profileImage} alt="프로필" className="profile-image" />
                    <span className="username">{username || 'Guest'}</span>
                </div>
                <div className="hamburger" onClick={toggleMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </div>
            </div>
            {menuOpen && (
                <div className="dropdown-menu">
                    <ul>
                        <li>
                            <Link to="/matching-list">{t("navbar.menu.matching_list")}</Link>
                        </li>
                        <li>
                            <Link to="/chat-list">{t("navbar.menu.chat_list")}</Link>
                        </li>
                        <li onClick={handleLogout} className="logout-button">
                            {t("navbar.menu.logout")}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar;
