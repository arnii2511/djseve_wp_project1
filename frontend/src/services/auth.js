import API from './api';

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUserFromStorage() {
  const s = localStorage.getItem('user');
  return s ? JSON.parse(s) : null;
}

export async function login(data) {
  const res = await API.post('/auth/login', data);
  return res.data;
}

export async function register(data) {
  const res = await API.post('/auth/register', data);
  return res.data;
}
