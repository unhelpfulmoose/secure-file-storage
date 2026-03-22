import axios from 'axios';

const API_URL = 'http://localhost:8080';

let credentials = {
    username: '',
    password: ''
};

export const setCredentials = (username: string, password: string) => {
    credentials = { username, password };
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_URL}/files/upload`, formData, {
    auth: credentials,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getFiles = async () => {
  return axios.get(`${API_URL}/files`, {
    auth: credentials
  });
};

export const downloadFile = async (id: number) => {
  return axios.get(`${API_URL}/files/${id}/download`, {
    auth: credentials,
    responseType: 'blob'
  });
};