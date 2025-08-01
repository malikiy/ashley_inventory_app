import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const token = res.data.data.token;
  if (!token) throw new Error('Token not found in response');
  await AsyncStorage.setItem('token', token);
  return res.data.user;
}

export async function register(full_name, email, password) {
  const res = await api.post('/auth/register', { full_name, email, password });
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  console.log(res.data);
  
  return res.data;
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}
