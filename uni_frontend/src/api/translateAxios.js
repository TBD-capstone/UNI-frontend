import instance from "./basicAxios";

const getChatTranslate = async ({messageId}) => {
    const response = await instance.get(`/api/chat/translate/${messageId}`);
    return response.data;
};

export {getChatTranslate}