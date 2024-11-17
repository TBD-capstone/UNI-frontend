import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import './Register.css';
import { useTranslation } from "react-i18next";

function Register() {
    const { t } = useTranslation();
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
                    setStatusMessage(t("registerPage.status_messages.fetch_university_list_fail"));
                }
            } catch (error) {
                setStatusMessage(t("registerPage.status_messages.fetch_university_list_error"));
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
                    setStatusMessage(t("registerPage.status_messages.email_verification_success"));
                } else {
                    setStatusMessage(data.message ||  t("registerPage.status_messages.email_verification_fail"));
                }
            } catch (error) {
                setStatusMessage(t("registerPage.status_messages.email_verification_error"));
                console.error("Email verification error:", error);
            }
        } else {
            setStatusMessage(t("registerPage.status_messages.univ_verification_first"));
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
                    setStatusMessage(t("registerPage.status_messages.code_verification_success"));
                } else {
                    setStatusMessage(data.message ||  t("registerPage.status_messages.code_verification_fail"));
                }
            } catch (error) {
                setStatusMessage(t("registerPage.status_messages.code_verification_error"));
                console.error(error);
            }
        } else {
            setStatusMessage(t("registerPage.status_messages.email_verification_required"));
        }
    };

    const handleSubmit = async () => {
        if (!codeVerified) {
            setStatusMessage(t("registerPage.status_messages.all_verifications_required"));
            return;
        }
        if (password !== confirmPassword) {
            setStatusMessage(t("registerPage.status_messages.password_mismatch"));
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
                setStatusMessage(t("registerPage.status_messages.signup_success"));
            } else {
                setStatusMessage(t("registerPage.status_messages.signup_fail"));
            }
        } catch (error) {
            setStatusMessage(t("registerPage.status_messages.general_error"));
            console.error(error);
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
                onChange={(selectedOption) => {
                    setUnivName(selectedOption.value);
                    handleUnivVerification();
                }}
                placeholder={t("registerPage.university_placeholder")}
                isSearchable
            />

            <input
                type="email"
                className="input-field"
                placeholder={t("registerPage.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button
                className="verify-button"
                onClick={handleEmailVerification}
                disabled={!univVerified}
            >
                {t("registerPage.verify_email_button")}
            </button>

            <input
                type="text"
                className="input-field"
                placeholder={t("registerPage.verification_code_placeholder")}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
                className="verify-button"
                onClick={handleCodeVerification}
                disabled={!emailVerified}
            >
                {t("registerPage.verify_code_button")}
            </button>

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

            <div className="status-message">{statusMessage}</div>

            <div className="bottom-link">
                <Link to="/login">{t("registerPage.already_member")}</Link>
            </div>
        </div>
    );
}

export default Register;
