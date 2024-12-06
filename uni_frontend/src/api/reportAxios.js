import instance from "./basicAxios";

const postReport = async ({reportedId, data}) => {
    const response = await instance.post(`/api/user/${reportedId}/report`, data);
    return response.data;
};

export {postReport}