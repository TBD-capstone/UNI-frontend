// 상단바
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import profileImage from './profile-image.jpg'; // 프로필 이미지 경로 설정

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    // 메뉴 열기/닫기 핸들러
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // 로그아웃 핸들러
    const handleLogout = () => {
        // 로그아웃 로직 (쿠키 삭제 등)
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login'); // 로그인 페이지로 이동
    };

    return (
        <div className="navbar">
            <div className="logo">
                <img src="../public/UNI_Logo.png" alt="UNI Logo" className="uni-logo" />
            </div>

            <div className="menu-icons">
                <img src="./language-icon.png" alt="언어 변경" className="language-icon" />

                <div className="profile">
                    <img src={profileImage} alt="프로필" className="profile-image" />
                    <span className="username">NaRa123</span>
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
                            <Link to="/matching-list">매칭 목록</Link>
                        </li>
                        <li>
                            <Link to="/chat-list">채팅 목록</Link>
                        </li>
                        <li onClick={handleLogout} className="logout-button">
                            로그아웃
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar;
