import instance from "./basicAxios";

const getSearch = async ({params}) => {
    const response = await instance.get(`/api/home?${params}`);
    return response.data;
};

export {getSearch}