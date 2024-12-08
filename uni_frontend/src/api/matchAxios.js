import instance from "./basicAxios";

const getReceiveMatchList = async ({receiverId}) => {
    const response = await instance.get(`/api/match/list/receiver/${receiverId}`);
    return response;
};

const getRequestMatchList = async ({requesterId}) => {
    const response = await instance.get(`/api/match/list/requester/${requesterId}`);
    return response;
};

const postMatchRequest = async ({data}) => {
    const response = await instance.post('/api/match/request', data);
    return response.data;
};

const postMatchResponse = async ({data}) => {
    const response = await instance.post('/api/match/response', data);
    return response.data;
};

const getPendingMatch = async ({requesterId, receiverId}) => {
    const response = await instance.get(`/api/match/pending/${requesterId}/${receiverId}`);
    return response.data;
};

const getMatchList = async (matchingId) => {
    const response = await instance.get(`/api/match/${matchingId}`);
    return response.data;
};

const postReviewSubmit = async ({profileOwnerId, commenterId, matchingId, content, star}) => {
    const response = await instance.post(`/api/user/${profileOwnerId}/review/${commenterId}/matching/${matchingId}`, {
        content,
        star
    });
    return response;
};

export {
    getReceiveMatchList,
    getRequestMatchList,
    postMatchRequest,
    postMatchResponse,
    getPendingMatch,
    getMatchList,
    postReviewSubmit
}