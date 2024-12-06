import instance from "./basicAxios";

const getChatRoom = async () => {
    const response = await instance.get('/api/chat/rooms');
    return response;
};

const postRequestChat = async ({receiverId}) => {
    const response = await instance.post('/api/chat/request', {
        receiverId
    });
    return response.data;
};

const getChatRoomMessage = async (roomId) => {
    const response = await instance.get(`/api/chat/room/${roomId}`);
    return response.data;
};

const getChatTranslate = async (messageId) => {
    const response = await instance.get(`/api/chat/translate/${messageId}`);
    return response.data.text;
};

const postChatRoomLeave = async (roomId) => {
    const response = await instance.get(`/api/chat/room/${roomId}/leave`);
    return response;
};


export {getChatRoom, postRequestChat, getChatRoomMessage, getChatTranslate, postChatRoomLeave}