import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css'; // 스타일 파일 추가

function NotFound() {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/'); // 홈으로 이동
    };

    return (
        <div className="not-found">
            <img src="/UNI_ICON.png" alt="404 Not Found" className="not-found-image" />
            <h1>Oops! Page not found.</h1>
            <p>The page you are looking for does not exist or has been moved.</p>
            <button onClick={goToHome} className="not-found-button">
                Go to Home
            </button>
        </div>
    );
}

export default NotFound;
