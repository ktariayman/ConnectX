import axios from 'axios';
import { BoardConfig, DifficultyLevel } from '@connect-x/shared';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
 baseURL: API_BASE_URL,
});

export const roomApi = {
 list: async () => {
  const response = await api.get('/rooms');
  return response.data;
 },
 get: async (roomId: string) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
 },
 create: async (data: {
  username: string;
  difficulty: DifficultyLevel;
  isPublic: boolean;
  config: BoardConfig;
 }) => {
  const response = await api.post('/rooms', data);
  return response.data;
 },
 join: async (roomId: string, username: string) => {
  const response = await api.post(`/rooms/${roomId}/join`, { username });
  return response.data;
 },
};

export const gameHistoryApi = {
 getByRoomId: async (roomId: string) => {
  const response = await api.get(`/history/room/${roomId}`);
  return response.data;
 },
 getByPlayer: async (username: string) => {
  const response = await api.get(`/history/player/${username}`);
  return response.data;
 },
 getAll: async () => {
  const response = await api.get('/history');
  return response.data;
 },
};
