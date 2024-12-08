import instance from "./basicAxios";

const postReport = async ({reportedId, title, reporterId, category, detail, reason}) => {
    const response = await instance.post(`/api/user/${reportedId}/report`, {
        title: title,
        reportedUserId: reportedId,
        reporterUserId: reporterId,
        category: category,
        detailedReason: detail,
        reason: reason
    });
    return response.data;
};

export {postReport}