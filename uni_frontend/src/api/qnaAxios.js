import instance from "./basicAxios";

const getQna = async ({userId}) => {
    const response = await instance.get(`/api/user/${userId}/qnas`);
    return response.data;
};
const postQna = async ({userId, commenterId, data}) => {
    const response = await instance.post(`/api/user/${userId}/qnas/${commenterId}`, data);
    return response.data;
};
const postQnaReply = async ({userId, qnaId, commenterId, data}) => {
    const response = await instance.post(`/api/user/${userId}/qnas/${qnaId}/replies/${commenterId}`, data);
    return response.data;
};

const deleteQna = async ({qnaId}) => {
    const response = await instance.delete(`/api/qnas/${qnaId}`);
    return response.data;
};

const postQnaLike = async ({userId, qnaId}) => {
    const response = await instance.post(`/api/qnas/${qnaId}/likes`);
    return response.data;
};

export {
    getQna,
    postQna,
    postQnaReply,
    deleteQna,
    postQnaLike
}