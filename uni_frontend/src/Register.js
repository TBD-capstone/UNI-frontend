import React from 'react';
import './Register.css';

function Register() {
    return (
        <div className="signup-page">

            {/* 메인 로고 */}
            <div className="main-logo"></div>

            {/* 회원가입 제목 */}
            <h1 className="signup-title">회원가입</h1>

            {/* 사용자 유형 선택 */}
            <div className="user-type">
                <label><input type="radio" name="userType" value="korean" /> 한국인 대학생</label>
                <label><input type="radio" name="userType" value="foreigner" /> Foreigner</label>
            </div>

            {/* 이메일 입력 필드와 인증 버튼 */}
            <input type="email" className="input-field" placeholder="이메일" />
            <button className="verify-button">인증하기</button>

            {/* 인증번호 입력 필드 */}
            <input type="text" className="input-field" placeholder="인증번호" />
            <button className="verify-button">인증확인</button>

            {/* 이름 입력 필드 */}
            <input type="text" className="input-field" placeholder="이름" />

            {/* 비밀번호 입력 필드 */}
            <input type="password" className="input-field" placeholder="비밀번호" />

            {/* 비밀번호 확인 입력 필드 */}
            <input type="password" className="input-field" placeholder="비밀번호 확인" />

            {/* 회원가입 버튼 */}
            <button className="signup-button">회원가입</button>

            {/* 하단 링크 */}
            <div className="bottom-link">회원이신가요? 로그인하세요</div>
        </div>
    );
}

export default Register;
