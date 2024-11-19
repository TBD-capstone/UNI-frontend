import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import './login.css';
import {useTranslation} from "react-i18next";

function Login() {
    const {t} = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const data = await response.json();
            console.log('로그인 응답 데이터:', data); // 응답 데이터 확인
            if (data.status === 'success') {
                // 이전에 저장된 쿠키 제거
                Cookies.remove('userName', {path: '/'});
                Cookies.remove('userId', {path: '/'});
                Cookies.remove('isKorean', {path: '/'});
                // 새 로그인 정보 저장
                Cookies.set('userName', data.userName, {expires: 1, path: '/'});
                Cookies.set('userId', data.userId, {expires: 1, path: '/'});
                Cookies.set('isKorean', data.isKorean, {expires: 1, path: '/'});
                console.log('유저 이름:', Cookies.get('userName'));
                console.log('유저 ID:', Cookies.get('userId'));
                console.log('한국인 여부:', Cookies.get('isKorean'));
                setStatusMessage(data.message || t("loginPage.status_messages.success"));
                navigate('/main'); // 메인 페이지로 이동
            } else {
                setStatusMessage(data.message || t("loginPage.status_messages.fail"));
            }
        } catch (error) {
            setStatusMessage(t("loginPage.status_messages.error"));
            console.error('로그인 요청 중 오류:', error);
        }
    };

    return (
        <div className="login-page">
            <div className="logo"></div>
            <h1 className="login-title">{t("loginPage.title")}</h1>
            <div className="input-container">
                <input
                    type="email"
                    className="input-field"
                    placeholder={t("loginPage.email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="input-container">
                <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder={t("loginPage.password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-field-icon" onClick={handleTogglePassword}>
                    {showPassword ? "🙈" : "👁️"}
                </span>
            </div>

            <button className="login-button" onClick={handleLogin}> {t("loginPage.login_button")}</button>
            <div className="status-message">{statusMessage}</div>
            <div className="bottom-link">
                <a href="/forgot-password">{t("loginPage.forgot_password")}</a>
                <br/>
                <Link to="/register">{t("loginPage.sign_up")}</Link>
            </div>
        </div>
    );
}

export default Login;