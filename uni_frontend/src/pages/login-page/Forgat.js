import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {postForgotPassword, postResetPassword} from "../../api/authAxios";

const Forget = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [emailVerification, setEmailVerification] = useState('pending');

    const handleVerification = async () => {
        const data = await postForgotPassword({email: email});
        setEmailVerification(() => data.status);
    };
    const handleEdit = async () => {
        const data = await postResetPassword({
            email: email,
            code: verificationCode,
            newPassword: newPassword
        });
        if (data.status === 'success') {
            alert('비밀번호 초기화 성공, 로그인 페이지로 넘어갑니다.');
            navigate('/login');
        } else {
            alert('초기화 실패, 코드를 다시 확인해주세요.');
        }
    }
    return (
        <div className="login-page">

            <h1 className="login-title">{'비밀번호 초기화'}</h1>
            <div className="input-container">
                <input
                    type='email'
                    className='input-field'
                    placeholder={t("loginPage.email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!emailVerification}
                />
            </div>
            <button className="login-button" onClick={handleVerification}>{'인증'}</button>
            {emailVerification === 'fail' && '이메일 인증 실패'}
            {emailVerification === 'success' && <>
                <div className="input-container">
                    <input
                        type='text'
                        className='input-field'
                        placeholder={t("loginPage.email_placeholder")}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                    />
                </div>
                <div className="input-container">
                    <input
                        type='password'
                        className='input-field'
                        placeholder={t("loginPage.email_placeholder")}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <button className="login-button" onClick={handleEdit}>{'수정'}</button>
            </>
            }
        </div>
    )
        ;
}

export default Forget;