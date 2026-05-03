// All communication with the backend goes through this file.
// Each function makes one API call and returns the response.

import axios from 'axios';

// Backend URL — defaults to localhost. Override by setting VITE_API_URL in a .env.local file.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// The JWT token is stored here after login and cleared on logout.
// It is attached to every request that requires authentication.
let token: string | null = null;

export type LoginResponse = {
    token: string;
    username: string;
    role: string;
};

export type FileMetadata = {
    id: number;
    fileName: string;
    fileType: string;
    uploadAt: string;
};

export type AppUser = {
    id: number;
    username: string;
    role: string;
    createdAt: string;
};

export type AuditEntry = {
    id: number;
    action: string;
    username: string | null;
    details: string | null;
    ip: string | null;
    createdAt: string;
};

type Page<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
};

// Sends username and password to the backend, stores the returned JWT token.
export const login = async (username: string, password: string) => {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, { username, password });
    token = response.data.token;
    return response.data;
};

// Tells the backend to revoke the token, then clears it locally.
export const logout = async () => {
    try {
        await axios.post<unknown>(`${API_URL}/auth/logout`, {}, { headers: authHeader() });
    } finally {
        token = null;
    }
};

// Builds the Authorization header used by all authenticated requests.
const authHeader = () => ({ Authorization: `Bearer ${token}` });

// Uploads a file to the backend. Sends it as multipart/form-data (standard file upload format).
export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post<FileMetadata>(`${API_URL}/files/upload`, formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' }
    });
};

// Fetches a paginated list of files. page starts at 0.
export const getFiles = async (page = 0, size = 20) => {
    return axios.get<Page<FileMetadata>>(`${API_URL}/files`, {
        headers: authHeader(),
        params: { page, size }
    });
};

// Deletes a file by its ID.
export const deleteFile = async (id: number) => {
    return axios.delete<unknown>(`${API_URL}/files/${id}`, { headers: authHeader() });
};

// Downloads a file as a binary blob so the browser can save it.
export const downloadFile = async (id: number) => {
    return axios.get<Blob>(`${API_URL}/files/${id}/download`, {
        headers: authHeader(),
        responseType: 'blob'
    });
};

// Fetches a file as a binary blob for in-browser preview (not saved to disk).
export const previewFile = async (id: number) => {
    return axios.get<Blob>(`${API_URL}/files/${id}/preview`, {
        headers: authHeader(),
        responseType: 'blob'
    });
};

// Fetches all users (admin only).
export const getUsers = async () => {
    return axios.get<AppUser[]>(`${API_URL}/users`, { headers: authHeader() });
};

// Creates a new user (admin only).
export const createUser = async (username: string, password: string, role: string) => {
    return axios.post<AppUser>(`${API_URL}/users`, { username, password, role }, { headers: authHeader() });
};

// Deletes a user by ID (admin only).
export const deleteUser = async (id: number) => {
    return axios.delete<unknown>(`${API_URL}/users/${id}`, { headers: authHeader() });
};

// Fetches a paginated audit log (admin only).
export const getAuditLog = async (page = 0, size = 50) => {
    return axios.get<Page<AuditEntry>>(`${API_URL}/audit`, {
        headers: authHeader(),
        params: { page, size }
    });
};
