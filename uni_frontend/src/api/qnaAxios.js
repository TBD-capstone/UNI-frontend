import instance from "./basicAxios";

const getQna = async ({userId}) => {
    const response = await instance.get(`/api/user/${userId}/qnas`);
    return response.data;
};
const postQna = async ({userId, commenterId, content}) => {
    const response = await instance.post(`/api/user/${userId}/qnas/${commenterId}`, {content});
    return response.data;
};
const postQnaReply = async ({userId, qnaId, commenterId, content}) => {
    const response = await instance.post(`/api/user/${userId}/qnas/${qnaId}/replies/${commenterId}`, {content});
    return response.data;
};

const deleteQna = async ({qnaId}) => {
    const response = await instance.delete(`/api/qnas/${qnaId}`);
    return response.data;
};

const postQnaLike = async ({qnaId}) => {
    const response = await instance.post(`/api/qnas/${qnaId}/likes`);
    return response.data;
};

const deleteReply = async ({replyId}) => {
    const response = await instance.delete(`/api/replies/${replyId}`);
    return response.data;
};

export {
    getQna,
    postQna,
    postQnaReply,
    deleteQna,
    postQnaLike,
    deleteReply
}