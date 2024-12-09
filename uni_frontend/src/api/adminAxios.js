import instance from "./basicAxios";

const getUserListByAdmin = async (params) => {
    const response = await instance.get(`/api/admin/users?${params}`)
        .catch((error) => console.error('유저 데이터 불러오기 실패:', error));
    return response.data;
};
const getAdListByAdmin = async () => {
    const response = await instance.get(`/api/admin/ad`)
        .catch((error) => console.error('광고 데이터 불러오기 실패:', error));
    return response.data;
};
const postAdStateByAdmin = async ({data}) => {
    const response = await instance.post(`/api/admin/ad`, data);
    return response.data;
};

const postAdNewByAdmin = async (formData) => {
    const response = await instance.post(`/api/admin/ad/new`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const patchUserStateByAdmin = async ({userStatus, banDays, data}) => {
    const response = await instance.patch(`/api/admin/users/2/status?status=${userStatus}&banDays=${banDays}`, data);
    return response.data;
};

const getReportedUserListByAdmin = async (params) => {
    const response = await instance.get(`/api/admin/reported-users?${params}`)
        .catch((error) => console.error('신고된 유저 데이터 불러오기 실패:', error));
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