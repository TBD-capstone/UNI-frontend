import instance from "./basicAxios";

const getUserListByAdmin = async () => {
    const response = await instance.get(`/api/admin/users`);
    return response.data;
};
const getAdListByAdmin = async () => {
    const response = await instance.get(`/api/admin/ad`);
    return response.data;
};
const postAdStateByAdmin = async ({data}) => {
    const response = await instance.post(`/api/admin/ad`, data);
    return response.data;
};

const postAdNewByAdmin = async ({data}) => {
    const response = await instance.post(`/api/admin/ad/new`, data);
    return response.data;
};

const patchUserStateByAdmin = async ({userStatus, banDays}) => {
    const response = await instance.patch(`/api/admin/users/2/status?status=${userStatus}&banDays=${banDays}`, data);
    return response.data;
};

const getReportedUserListByAdmin = async () => {
    const response = await instance.get(`/api/admin/reported-users`);
    return response.data;
};

const postBlindUserByAdmin = async ({userId}) => {
    const response = await instance.post(`/api/admin/users/${userId}/blind-content`);
    return response.data;
};

const postUnBlinedUserByAdmin = async ({userId}) => {
    const response = await instance.post(`/api/admin/users/${userId}/unblind-content`);
    return response.data;
};

export {
    getUserListByAdmin,
    getAdListByAdmin,
    postAdNewByAdmin,
    postAdStateByAdmin,
    patchUserStateByAdmin,
    getReportedUserListByAdmin,
    postBlindUserByAdmin,
    postUnBlinedUserByAdmin,
}