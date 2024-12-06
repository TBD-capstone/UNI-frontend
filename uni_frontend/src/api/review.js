import instance from "./basicAxios";

const getReview = async ({userId}) => {
    const response = await instance.get(`/api/review/${userId}`);
    return response.data;
};
const postReview = async ({userId, commenterId}) => {
    const response = await instance.post(`/api/user/${userId}/review/${commenterId}/matching/${matchingId}`);
    return response.data;
};
const postReviewReply = async ({userId, reviewId, commenterId}) => {
    const response = await instance.post(`/api/review/${reviewId}/reply/${commenterId}`);
    return response.data;
};

export {getReview, postReview, postReviewReply}