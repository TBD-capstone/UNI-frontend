import axios from "axios";

const translateAxios = axios.create();
translateAxios.defaults.baseURL = `${process.env.REACT_APP_API_URL}`

const getChatTranslate = async ({messageId}) => {
    const response = await translateAxios.get(`/api/chat/translate/${messageId}`);
    return response.data;
};

export {getChatTranslate}