import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './navbar.css';
import profileImage from './profile-image.png'; // 프로필 이미지 경로 설정
import languageIcon from './language-icon.png'; // 언어 아이콘 이미지 경로

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    // 로그인한 유저 이름 가져오기
    useEffect(() => {
        const cookieUsername = Cookies.get('userName'); // 쿠키에서 유저 이름 가져오기
        if (cookieUsername) {
            setUsername(cookieUsername);
        }
    }, []);

    // 메뉴 열기/닫기 핸들러
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // 로그아웃 핸들러
    const handleLogout = () => {
        // 로그아웃 로직 (쿠키 삭제 등)
        document.cookie = 'userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login'); // 로그인 페이지로 이동
    };

    // 언어 선택 메뉴 열기/닫기 핸들러
    const toggleLanguageMenu = () => {
        setLanguageMenuOpen(!languageMenuOpen);
    };

    // 언어 변경 요청 핸들러
    const handleLanguageChange = async (newLanguage) => {
        try {
            const response = await fetch('https://api-free.deepl.com/v2/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'DeepL-Auth-Key yourAuthKey', // 실제 API 키 입력 필요
                },
                body: JSON.stringify({
                    text: ['Change language request'], // 요청 예제 텍스트
                    target_lang: newLanguage,
                }),
            });

            const data = await response.json();
            console.log('언어 변경 응답 데이터:', data); // 응답 데이터 확인
            setLanguageMenuOpen(false);
            alert(
                newLanguage === 'en'
                    ? 'Language changed to English'
                    : newLanguage === 'zh'
                        ? '语言已更改为中文'
                        : '언어가 한국어로 변경되었습니다.'
            );
        } catch (error) {
            console.error('언어 변경 요청 중 오류:', error);
        }
    };

    return (
        <div className="navbar">
            <div className="logo">
                <img src="/UNI_Logo.png" alt="UNI Logo" className="uni-logo" />
            </div>

            <div className="menu-icons">
                {/* 언어 변경 버튼 */}
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
