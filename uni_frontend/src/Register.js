import React, { useState } from 'react';
import './Register.css';

function Register() {
    const [isKorean, setIsKorean] = useState(true);
    const [email, setEmail] = useState('');
    const [univName, setUnivName] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [univVerified, setUnivVerified] = useState(false);

    const handleUserTypeChange = (e) => {
        setIsKorean(e.target.value === 'korean');
        setEmailVerified(false);
    };

    const handleEmailVerification = async () => {
        /*const endpoint = isKorean ? '/auth/api/validate' : '/auth/api/foreign';
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setEmailVerified(true);
                setStatusMessage("이메일 인증 성공!");
            } else {
                setEmailVerified(false);
                setStatusMessage("이메일 인증 실패");
            }
        } catch (error) {
            setEmailVerified(false);
            setStatusMessage("이메일 인증 중 오류가 발생했습니다");
            console.error(error);
        }*/
        setEmailVerified(true);
        setStatusMessage("이메일 인증 성공!"); //임시방편
    };

    const handleUnivVerification = async () => {
        /*try {
            const response = await fetch('/auth/api/univ', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ univ_name: univName }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setUnivVerified(true);
                setStatusMessage("대학 인증 성공!");
            } else {
                setUnivVerified(false);
                setStatusMessage("대학 인증 실패");
            }
        } catch (error) {
            setUnivVerified(false);
            setStatusMessage("대학 인증 중 오류가 발생했습니다");
            console.error(error);
        }*/
        setUnivVerified(true);
        setStatusMessage("대학 인증 성공!");//임시방편2
    };

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            setStatusMessage("비밀번호가 일치하지 않습니다");
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isKorean: isKorean,
                    email: email,
                    univName: univName,
                    name: nickname,
                    password: password,
                }),
            });

            const data = await response.json();
            if (data.status === 'success') {
                setStatusMessage("회원가입 성공!");
            } else {
                setStatusMessage("회원가입 실패");
            }
        } catch (error) {
            setStatusMessage("회원가입 중 오류가 발생했습니다");
            console.error(error);
        }
    };

    return (
        <div className="signup-page">
            <div className="main-logo"></div>
            <h1 className="signup-title">회원가입</h1>

            <div className="user-type">
                <label>
                    <input type="radio" name="userType" value="korean" checked={isKorean} onChange={handleUserTypeChange} /> 한국인 대학생
                </label>
                <label>
                    <input type="radio" name="userType" value="foreigner" checked={!isKorean} onChange={handleUserTypeChange} /> 외국인
                </label>
            </div>

            <input type="email" className="input-field" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="verify-button" onClick={handleEmailVerification}>이메일 인증하기</button>

            <input type="text" className="input-field" placeholder="대학명" value={univName} onChange={(e) => setUnivName(e.target.value)} />
            <button className="verify-button" onClick={handleUnivVerification}>대학 인증하기</button>

            <input type="text" className="input-field" placeholder="이름" value={nickname} onChange={(e) => setNickname(e.target.value)} />

            <input type="password" className="input-field" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />

            <input type="password" className="input-field" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <button className="signup-button" onClick={handleSubmit}>회원가입</button>

            <div className="status-message">{statusMessage}</div>

            <div className="bottom-link">회원이신가요? 로그인하세요</div>
        </div>
    );
}

export default Register;
