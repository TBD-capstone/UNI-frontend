import axios from "axios";

const authInstance = axios.create();
authInstance.defaults.baseURL = process.env.REACT_APP_API_URL;
authInstance.defaults.headers.common['Content-Type'] = 'application/json';

const postLogin = async ({email, password}) => {
    const response = await authInstance.post('/api/auth/login', {
        email: email,
        password: password,
    });
    return response.data;
};
const postLogout = async () => {
    const response = await authInstance.post('/api/auth/logout');
    return response.data;
};
const postSignup = async ({signupData}) => {
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

const postForgotPassword = async ({email}) => {
    const response = await authInstance.post('/api/auth/forgot-password', {
        email
    });
    return response.data;
};
const postResetPassword = async ({email, code, newPassword}) => {
    const response = await authInstance.post('/api/auth/reset-password', {
        email,
        code,
        newPassword
    });
    return response.data;
};

export {
    postLogin,
    postLogout,
    postSignup,
    getUniv,
    postVerify,
    postValidate,
    postForgotPassword,
    postResetPassword
}