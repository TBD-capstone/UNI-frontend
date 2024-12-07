import instance from "./basicAxios";

const getMarkers = async ({userId}) => {
    const response = await instance.get(`/api/markers/user/${userId}`);
    return response.data;
};

const postAddMarker = async ({userId, data}) => {
    const response = await instance.post(`/api/markers/add/${userId}`, data);
    return response.data;
};

const deleteMarker = async ({markerId}) => {
    const response = await instance.delete(`/api/markers/delete/${markerId}`);
    return response.data;
};

export {getMarkers, postAddMarker, deleteMarker}