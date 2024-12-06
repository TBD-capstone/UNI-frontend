import axios from "axios";
import Cookies from "js-cookie";

const language = Cookies.get('language');

const homeInstance = axios.create();

if(language) {
    homeInstance.defaults.headers.common['Accept-language'] = language;
}

const getSearch = async ({params}) => {
    const response = await homeInstance.get(`/api/home?${params}`);
    return response.data;
};

export {getSearch}