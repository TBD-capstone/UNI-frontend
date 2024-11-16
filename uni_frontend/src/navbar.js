import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './navbar.css';
import profileImage from './profile-image.png'; // 프로필 이미지 경로 설정

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    // 로그인 상태 확인
    useEffect(() => {
        const username = Cookies.get('username'); // 쿠키에서 username 확인
        const userId = Cookies.get('userId'); // 쿠키에서 userId 확인

        if (username && userId) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    // 메뉴 열기/닫기 핸들러
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // 로그아웃 핸들러
    const handleLogout = () => {
        // 로그아웃 로직 (쿠키 삭제 등)
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setIsLoggedIn(false); // 상태 업데이트
        navigate('/login'); // 로그인 페이지로 이동
    };

    // 로그인 페이지로 이동 핸들러
    const handleLoginRedirect = () => {
        navigate('/login'); // 로그인 페이지로 이동
    };

    return (
        <div className="navbar">
            <div className="logo">
                <img src="/UNI_Logo.png" alt="UNI Logo" className="uni-logo" />

            </div>

            <div className="menu-icons">
                <img src="./language-icon.png" alt="언어 변경" className="language-icon" />

                {isLoggedIn ? (
                    <div className="profile">
                        <img src={profileImage} alt="프로필" className="profile-image" />
                        <span className="username">NaRa123</span>
                    </div>
                ) : (
                    <button className="login-button" onClick={handleLoginRedirect}>
                        로그인
                    </button>
                )}

                <div className="hamburger" onClick={toggleMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </div>
            </div>

            {menuOpen && (
                <div className="dropdown-menu">
                    <ul>
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <Link to="/matching-list">매칭 목록</Link>
                                </li>
                                <li>
                                    <Link to="/chat-list">채팅 목록</Link>
                                </li>
                                <li onClick={handleLogout} className="logout-button">
                                    로그아웃
                                </li>
                            </>
                        ) : (
                            <li onClick={handleLoginRedirect} className="login-menu-item">
                                로그인
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar;
