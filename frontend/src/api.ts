import axios from 'axios';

const API_URL = 'http://localhost:8080';

let token: string | null = null;

export const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    token = response.data.token;
    return response.data as { token: string; username: string; role: string };
};

const authHeader = () => ({ Authorization: `Bearer ${token}` });

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/files/upload`, formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' }
    });
};

export const getFiles = async () => {
    return axios.get(`${API_URL}/files`, { headers: authHeader() });
};

export const downloadFile = async (id: number) => {
    return axios.get(`${API_URL}/files/${id}/download`, {
        headers: authHeader(),
        responseType: 'blob'
    });
};
