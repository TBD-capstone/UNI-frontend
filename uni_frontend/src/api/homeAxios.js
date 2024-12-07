import axios from "axios";
import Cookies from "js-cookie";

const language = Cookies.get('language');

const homeInstance = axios.create();

homeInstance.defaults.baseURL = process.env.REACT_APP_API_URL;
if(language) {
    homeInstance.defaults.headers.common['Accept-language'] = language;
}

const getSearch = async (params) => {
    const response = await homeInstance.get(`/api/home?${params}`);
    return response.data;
};

const getAd = async () => {
    const response = await homeInstance.get(`/api/ad`);
    return response.data;
}

export {getSearch, getAd}