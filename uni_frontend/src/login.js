import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './login.css';

function Login() {
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
                // 쿠키에 로그인 정보 저장
                Cookies.set('userName', data.userName, { expires: 1, path: '/' });
                Cookies.set('userId', data.userId, { expires: 1, path: '/' });
                Cookies.set('isKorean', data.isKorean, { expires: 1, path: '/' });

                console.log('유저 이름:', Cookies.get('userName'));
                console.log('유저 ID:', Cookies.get('userId'));
                console.log('한국인 여부:', Cookies.get('isKorean'));

                setStatusMessage(data.message || '로그인 성공!');
                navigate('/'); // 메인 페이지로 이동
            } else {
                setStatusMessage(data.message || '로그인 실패: 정보가 올바르지 않습니다.');
            }
        } catch (error) {
            setStatusMessage('로그인 중 오류가 발생했습니다.');
            console.error('로그인 요청 중 오류:', error);
        }
    };


    return (
        <div className="login-page">
            <div className="logo"></div>
            <h1 className="login-title">로그인</h1>

            <div className="input-container">
                <input
                    type="email"
                    className="input-field"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="input-container">
                <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-field-icon" onClick={handleTogglePassword}>
                    {showPassword ? "🙈" : "👁️"}
                </span>
            </div>

            <button className="login-button" onClick={handleLogin}>로그인</button>

            <div className="status-message">{statusMessage}</div>

            <div className="bottom-link">
                <a href="/forgot-password">비밀번호 분실</a>
                <br />
                <Link to="/register">회원가입</Link>
            </div>
        </div>
    );
}

export default Login;
