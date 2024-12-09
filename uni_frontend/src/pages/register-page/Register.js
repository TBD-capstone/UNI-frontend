import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './Register.css';
import { useTranslation } from "react-i18next";
import {getUniv, postSignup, postValidate, postVerify} from "../../api/authAxios";
import TooltipCircle from "../../components/TooltipCircle"

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
    const [rawUnivList, setRawUnivList] = useState([]);



    useEffect(() => {
        const fetchUnivList = async () => {
            try {
                const data = await getUniv();

                if (Array.isArray(data)) {
                    setRawUnivList(data);
                } else {
                    alert(t("registerPage.status_messages.fetch_university_list_fail"));
                }
            } catch (error) {
                alert(t("registerPage.status_messages.fetch_university_list_error"));
            }
        };

        fetchUnivList();
    }, [t]);

    useEffect(() => {
        // isKorean 값에 따라 동적으로 univList를 설정
        const transformedList = rawUnivList.map((university) => ({
          value: isKorean ? university.univName : university.enUnivName,
          label: isKorean ? university.univName : university.enUnivName,
        }));
        setUnivList(transformedList);
        
      }, [isKorean, rawUnivList]);

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
            <h1 className="signup-title">{t(
                isKorean
                    ? t("회원가입")
                    : t("Sign up")
            )}</h1>

            <div className="user-type">
                <button
                    className={`user-type-button ${isKorean ? 'selected' : ''}`}
                    onClick={() => handleUserTypeChange('korean')}
                >
                    한국 대학생
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
                value={univList.find((option) => option.value === univName) || null}
                onChange={(selectedOption) => setUnivName(selectedOption?.value || null)}
                placeholder={t(
                    isKorean
                      ? t("대학교")
                      : t("University")
                  )}
                isSearchable
            />

            <div className="input-field-container">
                <input
                    type="email"
                    className="input-field"
                    placeholder={t(
                        isKorean
                          ? t("대학교 이메일을 입력해주세요")
                          : t("Please enter korean university email")
                      )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className="input-field-button" onClick={handleEmailVerification}>
                    {t(
                        isKorean
                          ? t("메일 인증")
                          : t("Verify Email")
                    )}
                </button>
            </div>

            <div className="input-field-container">
                <input
                    type="text"
                    className="input-field"
                    placeholder={t(
                        isKorean
                          ? t("인증 코드")
                          : t("Verification code")
                      )}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button className="input-field-button" onClick={handleCodeVerification}>
                    {t(
                        isKorean
                          ? t("인증 코드 확인")
                          : t("Verify Code")
                    )}
                </button>
            </div>

            <input
                type="text"
                className="input-field"
                placeholder={t(
                    isKorean
                      ? t("닉네임 (숫자와 영어만 사용해주세요)")
                      : t("nickname (Alphanumeric only)")
                  )}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />
            <TooltipCircle message={t(
                isKorean
                    ? t("다른 사람에게 보일 닉네임이에요.\n신중하게 결정해주세요")
                    : t("Nickname to be seen by others.\nPlease make a careful decision")
                )}
                position='bottom'>
            </TooltipCircle>

            <input
                type="password"
                className="input-field"
                placeholder={t(
                    isKorean
                      ? t("비밀번호")
                      : t("password")
                  )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                className="input-field"
                placeholder={t(
                    isKorean
                      ? t("비밀번호 확인")
                      : t("Verify code")
                  )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="signup-button" onClick={handleSubmit}>
                {t(
                    isKorean
                        ? t("회원가입")
                        : t("Sign up")
                )}
            </button>

            <div className="bottom-link">
                <Link to="/login">{t(
                    isKorean
                        ? t("이미 계정이 있으신가요? 로그인하기")
                        : t("Already have an account? Log in")
                )}</Link>
            </div>
        </div>
    );
}

export default Register;
