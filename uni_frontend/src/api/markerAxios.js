import instance from "./basicAxios";

const getMarkers = async ({userId}) => {
    const response = await instance.get(`/markers/user/${userId}`);
    return response.data;
};

const postAddMarker = async ({userId, data}) => {
    const response = await instance.post(`/markers/add/${userId}`, data);
    return response.data;
};

const deleteMarker = async ({markerId}) => {
    const response = await instance.delete(`/markers/delete/${markerId}`);
    return response.data;
};

export {getMarkers, postAddMarker, deleteMarker}