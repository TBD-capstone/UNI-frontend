import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가
import Select from 'react-select';
import './Register.css';
import { useTranslation } from "react-i18next";

function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate(); // navigate 훅 사용
    const [isKorean, setIsKorean] = useState(true);
    const [email, setEmail] = useState('');
    const [univName, setUnivName] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState({ message: '', isError: false });
    const [emailVerified, setEmailVerified] = useState(false);
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

                if (Array.isArray(data)) {
                    setUnivList(data.map((university) => ({
                        value: university.univName,
                        label: university.univName
                    })));
                } else {
                    setStatusMessage({ message: t("registerPage.status_messages.fetch_university_list_fail"), isError: true });
                }
            } catch (error) {
                setStatusMessage({ message: t("registerPage.status_messages.fetch_university_list_error"), isError: true });
            }
        };

        fetchUnivList();
    }, [t]);

    const handleUserTypeChange = (e) => {
        setIsKorean(e.target.value === 'korean');
    };

    const handleEmailVerification = async () => {
        if (!email.trim()) {
            setStatusMessage({ message: "이메일을 입력해주세요.", isError: true });
            return;
        }
        try {
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, univName })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setEmailVerified(true);
                setStatusMessage({ message: "이메일 인증 요청 성공!", isError: false });
            } else {
                setStatusMessage({ message: data.message || "이메일 인증 요청 실패.", isError: true });
            }
        } catch (error) {
            setStatusMessage({ message: "이메일 인증 요청 중 오류가 발생했습니다.", isError: true });
        }
    };

    const handleCodeVerification = async () => {
        if (!verificationCode.trim()) {
            setStatusMessage({ message: "인증 코드를 입력해주세요.", isError: true });
            return;
        }
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code: parseInt(verificationCode)
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setCodeVerified(true);
                setStatusMessage({ message: "인증 확인 성공!", isError: false });
            } else {
                setStatusMessage({ message: data.message || "인증 확인 실패.", isError: true });
            }
        } catch (error) {
            setStatusMessage({ message: "인증 확인 중 오류가 발생했습니다.", isError: true });
        }
    };

    const handleSubmit = async () => {
        if (!codeVerified || password !== confirmPassword) {
            setStatusMessage({ message: "입력값이 유효하지 않습니다.", isError: true });
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
                setStatusMessage({ message: "", isError: false }); // 기존 메시지 초기화
                alert("Signup successful! Redirecting to login page.");
                navigate('/login'); // 회원가입 성공 시 로그인 화면으로 이동
            } else {
                setStatusMessage({ message: data.message || "회원가입 실패.", isError: true });
            }
        } catch (error) {
            setStatusMessage({ message: "회원가입 중 오류가 발생했습니다.", isError: true });
        }
    };

    return (
        <div className="signup-page">
            <div className="main-logo"></div>
            <h1 className="signup-title">{t("registerPage.title")}</h1>

            <div className="user-type">
                <label>
                    <input
                        type="radio"
                        name="userType"
                        value="korean"
                        checked={isKorean}
                        onChange={handleUserTypeChange}
                    />
                    {t("registerPage.user_type.korean")}
                </label>
                <label>
                    <input
                        type="radio"
                        name="userType"
                        value="foreigner"
                        checked={!isKorean}
                        onChange={handleUserTypeChange}
                    />
                    {t("registerPage.user_type.foreigner")}
                </label>
            </div>

            <Select
                className="select-field"
                options={univList}
                onChange={(selectedOption) => setUnivName(selectedOption.value)}
                placeholder={t("registerPage.university_placeholder")}
                isSearchable
            />

            <div className="input-field-container">
                <input
                    type="email"
                    className="input-field"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className="input-field-button" onClick={handleEmailVerification}>
                    {t("registerPage.verify_email_button")}
                </button>
            </div>

            <div className="input-field-container">
                <input
                    type="text"
                    className="input-field"
                    placeholder="인증 코드"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button className="input-field-button" onClick={handleCodeVerification}>
                    {t("registerPage.verify_code_button")}
                </button>
            </div>

            <input
                type="text"
                className="input-field"
                placeholder={t("registerPage.name_placeholder")}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />

            <input
                type="password"
                className="input-field"
                placeholder={t("registerPage.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                className="input-field"
                placeholder={t("registerPage.confirm_password_placeholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="signup-button" onClick={handleSubmit}>
                {t("registerPage.signup_button")}
            </button>

            <div
                className="status-message"
                style={{ color: statusMessage.isError ? 'red' : 'blue' }}
            >
                {statusMessage.message}
            </div>

            <div className="bottom-link">
                <Link to="/login">{t("registerPage.already_member")}</Link>
            </div>
        </div>
    );
}

export default Register;
