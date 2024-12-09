import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './Register.css';
import { useTranslation } from "react-i18next";
import {getUniv, postSignup, postValidate, postVerify} from "../../api/authAxios";

function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isKorean, setIsKorean] = useState(true);
    const [email, setEmail] = useState('');
    const [univName, setUnivName] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeVerified, setCodeVerified] = useState(false);
    const [univList, setUnivList] = useState([]);

    useEffect(() => {
        const fetchUnivList = async () => {
            try {
                const data = await getUniv();

                if (Array.isArray(data)) {
                    setUnivList(data.map((university) => ({
                        value: university.univName,
                        label: university.univName
                    })));
                } else {
                    alert(t("registerPage.status_messages.fetch_university_list_fail"));
                }
            } catch (error) {
                alert(t("registerPage.status_messages.fetch_university_list_error"));
            }
        };

        fetchUnivList();
    }, [t]);

    const handleUserTypeChange = (userType) => {
        setIsKorean(userType === 'korean');
    };

    const handleEmailVerification = async () => {
        if (!email.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }
        try {
            const data = await postValidate({email, univName})
            if (data.status === 'success') {
                setEmailVerified(true);
                alert("이메일 인증 요청 성공!");
            } else {
                alert(data.message || "이메일 인증 요청 실패.");
            }
        } catch (error) {
            alert("이메일 인증 요청 중 오류가 발생했습니다.");
        }
    };

    const handleCodeVerification = async () => {
        if (!verificationCode.trim()) {
            alert("인증 코드를 입력해주세요.");
            return;
        }
        try {
            const data = await postVerify({
                email: email,
                univName: univName,
                code: parseInt(verificationCode)
            });
            if (data.status === 'success') {
                setCodeVerified(true);
                alert("인증 확인 성공!");
            } else {
                alert(data.message || "인증 확인 실패.");
            }
        } catch (error) {
            alert("인증 확인 중 오류가 발생했습니다.");
        }
    };

    const validateNickname = (nickname) => {
        const nicknameRegex = /^[a-z0-9]+$/; // 영어 소문자와 숫자만 허용
        return nicknameRegex.test(nickname);
    };

    const handleSubmit = async () => {
        if (!codeVerified || password !== confirmPassword) {
            alert("입력값이 유효하지 않습니다.");
            return;
        }

        if (!validateNickname(nickname)) {
            alert("닉네임은 영어 소문자와 숫자만 포함해야 합니다.");
            return;
        }

        try {
            const data = await postSignup({
                isKorean,
                email,
                univName,
                name: nickname,
                password
            })
            if (data.status === 'success') {
                alert("회원가입 성공! 로그인 페이지로 이동합니다.");
                navigate('/login');
            } else {
                alert(data.message || "회원가입 실패.");
            }
        } catch (error) {
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="signup-page">
            <div className="main-logo"></div>
            <h1 className="signup-title">{t("registerPage.title")}</h1>

            <div className="user-type">
                <button
                    className={`user-type-button ${isKorean ? 'selected' : ''}`}
                    onClick={() => handleUserTypeChange('korean')}
                >
                    {t("registerPage.user_type.korean")}
                </button>
                <button
                    className={`user-type-button ${!isKorean ? 'selected' : ''}`}
                    onClick={() => handleUserTypeChange('foreigner')}
                >
                    Foreigner
                </button>
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
                    placeholder={t("대학교 이메일을 입력해주세요")}
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
                    placeholder={t("인증 코드")}
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
                placeholder={t("닉네임(숫자와 영어만 사용해주세요)")}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />

            <input
                type="password"
                className="input-field"
                placeholder={t("비밀번호")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                className="input-field"
                placeholder={t("비밀번호 확인")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="signup-button" onClick={handleSubmit}>
                {t("registerPage.signup_button")}
            </button>

            <div className="bottom-link">
                <Link to="/login">{t("registerPage.already_member")}</Link>
            </div>
        </div>
    );
}

export default Register;
