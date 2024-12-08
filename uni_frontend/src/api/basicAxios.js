import axios from "axios";
import Cookies from "js-cookie";


const language = Cookies.get('language');

const instance = axios.create();

instance.defaults.baseURL = process.env.REACT_APP_API_URL;
if(language) {
    instance.defaults.headers.common['Accept-language'] = language;
}

const logout = () => {
    console.log('logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        // 헤더에 엑세스 토큰 담기
        const accessToken= localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

instance.interceptors.response.use(async function (response) {
    return response;
}, async function (error) {
    const {config, response: {status, data}} = error;
    console.error(error);

    if (status === 401 && data.message === "InvalidTokenException") {
        // 토큰이 없거나 잘못되었을 경우
        logout();
    }
    if (status === 401 && data.message === "TokenExpired") {
        try {
            const tokenRefreshResult = await instance.post('/api/auth/refresh', {
                refreshToken: localStorage.getItem('refreshToken')
            });
            if (tokenRefreshResult.status === 200) {
                const { accessToken, refreshToken } = tokenRefreshResult.data
                // 새로 발급받은 토큰을 스토리지에 저장
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                // 토큰 갱신 성공. API 재요청
                return instance(config)
            } else {
                logout();
            }
        } catch (e) {
            logout();
        }
    }
    // 403시 refresh - 일반 오류시 무한 refresh 발생으로 주석처리
    // if(status === 403){
    //     try {
    //         const tokenRefreshResult = await instance.post('/api/auth/refresh', {
    //             refreshToken: localStorage.getItem('refreshToken')
    //         });
    //         if (tokenRefreshResult.status === 200) {
    //             const { accessToken, refreshToken } = tokenRefreshResult.data
    //             // 새로 발급받은 토큰을 스토리지에 저장
    //             localStorage.setItem('accessToken', accessToken);
    //             localStorage.setItem('refreshToken', refreshToken);
    //             // 토큰 갱신 성공. API 재요청
    //             return instance(config)
    //         } else {
    //             logout();
    //         }
    //     } catch (e) {
    //         logout();
    //     }
    // }

    return Promise.reject(error);
});

export default instance;