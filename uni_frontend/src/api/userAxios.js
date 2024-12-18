import instance from "./basicAxios";

const getMyData = async () => {
    const response = await instance.get('/api/user/me');
    return response.data;
};
const getUserData = async ({userId}) => {
    const response = await instance.get(`/api/user/${userId}`);
    return response.data;
};

const postUserData = async ({userId, region, description, time, hashtags}) => {
    const response = await instance.post(`/api/user/${userId}`, {
        region,
        description,
        time,
        hashtags
    });
    return response.data;
};

const postUserImage = async ({userId, formData}) => {
    const response = await instance.post(`/api/user/${userId}/update-profile`, formData);
    return response.data;
};

export {getMyData, getUserData, postUserData, postUserImage}