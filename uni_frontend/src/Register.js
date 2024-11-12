import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
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
    const [verificationCode, setVerificationCode] = useState('');
    const [codeVerified, setCodeVerified] = useState(false);
    const [univList, setUnivList] = useState([]);

    useEffect(() => {
        const fetchUnivList = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/auth/univ`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                console.log("Fetched university data:", data);

                if (Array.isArray(data)) {
                    setUnivList(data.map((university) => ({
                        value: university.univName,
                        label: university.univName
                    })));
                } else {
                    setStatusMessage("대학 목록을 불러오는 데 실패했습니다.");
                }
            } catch (error) {
                setStatusMessage("대학 목록을 불러오는 중 오류가 발생했습니다.");
                console.error("Error fetching university list:", error);
            }
        };

        fetchUnivList();
    }, []);

    const handleUserTypeChange = (e) => {
        setIsKorean(e.target.value === 'korean');
        setEmailVerified(false);
        setUnivVerified(false);
        setCodeVerified(false);
    };

    const handleUnivVerification = () => {
        setUnivVerified(true);
    };

    const handleEmailVerification = async () => {
        if (univVerified) {
            try {
                const response = await fetch('/api/auth/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, univName })
                });
                const data = await response.json();
                console.log("Email verification response:", data);
                if (data.status === 'success') {
                    setEmailVerified(true);
                    setStatusMessage("이메일 인증 요청 성공!");
                } else {
                    setStatusMessage(data.message || "이메일 인증 요청 실패");
                }
            } catch (error) {
                setStatusMessage("이메일 인증 중 오류가 발생했습니다.");
                console.error("Email verification error:", error);
            }
        } else {
            setStatusMessage("먼저 대학 인증을 완료해주세요.");
        }
    };

    const handleCodeVerification = async () => {
        if (emailVerified) {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        univName,
                        code: parseInt(verificationCode)
                    })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    setCodeVerified(true);
                    setStatusMessage("인증 코드 확인 성공!");
                } else {
                    setStatusMessage(data.message || "인증 코드 검증 실패");
                }
            } catch (error) {
                setStatusMessage("인증 코드 확인 중 오류가 발생했습니다.");
                console.error(error);
            }
        } else {
            setStatusMessage("먼저 이메일 인증을 완료해주세요.");
        }
    };

    const handleSubmit = async () => {
        if (!codeVerified) {
            setStatusMessage("모든 인증 단계를 완료해주세요.");
            return;
        }
        if (password !== confirmPassword) {
            setStatusMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isKorean,
                    email,
                    univName,
                    name: nickname,
                    password
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setStatusMessage("회원가입 성공!");
            } else {
                setStatusMessage("회원가입 실패");
            }
        } catch (error) {
            setStatusMessage("회원가입 중 오류가 발생했습니다.");
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

            <Select
                className="select-field"
                options={univList}
                onChange={(selectedOption) => {
                    setUnivName(selectedOption.value);
                    handleUnivVerification();
                }}
                placeholder="대학교 선택"
                isSearchable
            />

            <input type="email" className="input-field" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="verify-button" onClick={handleEmailVerification} disabled={!univVerified}>이메일 인증하기</button>

            <input type="text" className="input-field" placeholder="인증 코드" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
            <button className="verify-button" onClick={handleCodeVerification} disabled={!emailVerified}>인증 코드 확인</button>

            <input type="text" className="input-field" placeholder="이름" value={nickname} onChange={(e) => setNickname(e.target.value)} />

            <input type="password" className="input-field" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />

            <input type="password" className="input-field" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <button className="signup-button" onClick={handleSubmit}>회원가입</button>

            <div className="status-message">{statusMessage}</div>

            <div className="bottom-link">
                <Link to="/login">회원이신가요? 로그인하세요</Link>
            </div>
        </div>
    );
}

export default Register;
