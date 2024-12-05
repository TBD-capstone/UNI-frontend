import axios from "axios";

// 기본 axios 인스턴스
export const basicAxios = axios.create({
    baseURL: process.env.REACT_APP_REQ_URL,
    headers: {
        "Content-Type": "application/json",

    },
});
// API 호출 함수
// export const apiClient = (method, url, data = null, params = null) => {
//     const client = basicAxios;
//
//     return client({
//         method,
//         url,
//         data: method === "get" ? null : data, // GET 요청 시 data를 제외
//         params: method === "get" ? params : null, // GET 요청 시 params 전달
//     });
// };
