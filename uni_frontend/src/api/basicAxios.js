import axios from "axios";
import Cookies from "js-cookie";


const language = Cookies.get('language');
const instance = axios.create();

instance.defaults.baseURL = process.env.REACT_APP_API_URL;
if(language) {
    instance.defaults.headers.common['Accept-language'] = language;
}

// 요청 인터셉터
// instance.interceptors.request.use(
//     (config) => {
//         // 헤더에 엑세스 토큰 담기
//         const accessToken= localStorage.getItem('accessToken');
//         if (accessToken) {
//             config.headers.Authorization = `Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     },
// );

export default instance;