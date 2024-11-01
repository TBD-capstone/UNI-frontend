import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

            if (data.status === 'success') {
                setStatusMessage(data.message || '로그인 성공!');
                // 로그인 성공 시 메인 페이지로 이동
                navigate('/');
            } else {
                setStatusMessage(data.message || '로그인 실패: 정보가 올바르지 않습니다');
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
