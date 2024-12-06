import instance from "./basicAxios";

const getReceiveMatchList = async ({receiverId}) => {
    const response = await instance.get(`/api/match/list/receiver/${receiverId}`);
    return response.data;
};

const getRequestMatchList = async ({requesterId}) => {
    const response = await instance.get(`/api/match/list/requester/${requesterId}`);
    return response.data;
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

export {
    getReceiveMatchList,
    getRequestMatchList,
    postMatchRequest,
    postMatchResponse,
    getPendingMatch
}