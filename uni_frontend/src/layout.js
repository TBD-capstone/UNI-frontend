import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar'; // 상단바 컴포넌트

function Layout() {
    return (
        <div>
            <Navbar /> {/* 모든 페이지에 공통으로 표시될 상단바 */}
            <main>
                <Outlet /> {/* 자식 컴포넌트를 렌더링 */}
            </main>
        </div>
    );
}

export default Layout;
