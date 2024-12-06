import instance from "./basicAxios";

const getChatRoom = async () => {
    const response = await instance.get('/api/chat/rooms');
    return response.data;
};

const requestChat = async (receiverId) => {
    const response = await instance.post('/api/chat/request', {
        receiverId: receiverId
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