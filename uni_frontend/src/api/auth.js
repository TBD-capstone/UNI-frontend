import axios from "axios";

const authInstance = axios.create();
authInstance.defaults.baseURL = process.env.REACT_APP_API_URL;

const login = async ({loginData}) => {
    const response = await authInstance.post('/api/auth/login', loginData);
    return response.data;
};
const logout = async () => {
    const response = await authInstance.post('/api/auth/logout');
    return response.data;
};
const signup = async ({signupData}) => {
    const response = await authInstance.post('/api/user/signup', signupData);
    return response.data;
};

const getUniv = async () => {
    const response = await authInstance.get('/api/auth/univ');
    return response.data;
};

const postValidate = async ({data}) => {
    const response = await authInstance.post('/api/auth/validate', data);
    return response.data;
};

const postVerify = async ({data}) => {
    const response = await authInstance.post('/api/auth/verify', data);
    return response.data;
};

const postForgotPassword = async ({data}) => {
    const response = await authInstance.post('/api/auth/forgot-password', data);
    return response.data;
};
const postResetPassword = async ({data}) => {
    const response = await authInstance.post('/api/auth/reset-password', data);
    return response.data;
};

export {
    login,
    logout,
    signup,
    getUniv,
    postVerify,
    postValidate,
    postForgotPassword,
    postResetPassword
}