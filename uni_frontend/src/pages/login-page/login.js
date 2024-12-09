import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './login.css';
import { useTranslation } from "react-i18next";
import {postLogin} from "../../api/authAxios";

function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            console.log({
                email: email,
                password: password,
            });
            const data = await postLogin({
                email: email,
                password: password,
            });
            console.log(data);

            if (data.status === 'success') {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                // 이전에 저장된 쿠키 제거
                Cookies.remove('userName', { path: '/' });
                Cookies.remove('userId', { path: '/' });
                // Cookies.remove('isKorean', { path: '/' });
                // Cookies.remove('imgProf',  { path: '/' });
                // Cookies.remove('imgBack',  { path: '/' });
                //
                // // 새 로그인 정보 저장
                Cookies.set('userName', data.userName, { expires: 1, path: '/' });
                Cookies.set('userId', data.userId, { expires: 1, path: '/' });
                // Cookies.set('isKorean', data.isKorean, { expires: 1, path: '/' });
                // Cookies.set('imgProf', data.imgProf, { expires: 1, path: '/' });
                // Cookies.set('imgBack', data.imgBack, { expires: 1, path: '/' });
                //
                console.log('유저 이름:', Cookies.get('userName'));
                console.log('유저 ID:', Cookies.get('userId'));
                // console.log('한국인 여부:', Cookies.get('isKorean'));
                // console.log('프로필 이미지:', Cookies.get('imgProf'));
                // console.log('배경화면 이미지:', Cookies.get('imgBack'));
                if (data.role == 'ADMIN'){
                    navigate('/admin');
                } else if (data.userStatus === 'BANNED'){
                    alert(t("Your Account is Banned. Please contact support."));
                    return;
                }
                else{
                    navigate('/main');
                }
            } else {
                alert(data.message || t("loginPage.status_messages.fail"));
            }
        } catch (error) {
            alert(t("loginPage.login_failed"));
            console.error('로그인 요청 중 오류:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    };

    return (
        <div className="login-page" onKeyDown={handleKeyDown}>
            <div className="main-logo"></div>
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

            <button className="login-button" onClick={handleLogin}>{t("loginPage.login_button")}</button>

            <div className="bottom-link">
                <Link to="/forget">{t("loginPage.forgot_password")}</Link>
                <br />
                <Link to="/register">{t("loginPage.sign_up")}</Link>
            </div>
        </div>
    );
}

export default Login;
