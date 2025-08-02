import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const createItem = async (payload) => {
  const response = await api.post('/items', payload);
  return response.data;
};

export const getItems = async () => {
  const response = await api.get('/items');
  return response.data;
};

export const updateItem = async (id, payload) => {
  const response = await api.put(`/items/${id}`, payload);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

export const uploadImage = async (uri) => {
  const fileName = uri.split('/').pop() || 'image.jpg';

  const token = await AsyncStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: fileName,
  });

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data?.data?.url;
};

export const getReport = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await api.get(`/items/report?${query}`);
  return response.data;
};

export const exportReportCSV = async (ids) => {
    
  const response = await api.post(
    '/items/export-report',
    { ids },
    {
      responseType: 'blob',
    }
  );
  
  return {
    status: response.status,
    data: response.data,
    message: 'CSV file received',
  };
};