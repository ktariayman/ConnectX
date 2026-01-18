import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi, gameHistoryApi } from '../lib/api';
import { useGameStore } from '../store/gameStore';
import { useRoomJoin } from '../hooks/useRoomJoin';
import { useSpectate } from '../hooks/useSpectate';

export function useRoomList() {
 const navigate = useNavigate();
 const { username } = useGameStore();
 const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
 const [isJoining, setIsJoining] = useState(false);

 const { data: rooms, isLoading, refetch } = useQuery({
  queryKey: ['rooms'],
  queryFn: roomApi.list,
  refetchInterval: 3000,
 });

 const { data: replays, isLoading: replaysLoading } = useQuery({
  queryKey: ['replays'],
  queryFn: gameHistoryApi.getAll,
  refetchInterval: 5000,
 });

 const { joinRoom } = useRoomJoin({
  onSuccess: () => {
   setIsJoining(false);
   setSelectedRoomId(null);
  },
  onError: (error) => {
   alert(error);
   setIsJoining(false);
   setSelectedRoomId(null);
  },
 });

 const { spectateRoom } = useSpectate({
  onSuccess: () => {
   setIsJoining(false);
   setSelectedRoomId(null);
  },
  onError: (error) => {
   alert(error);
   setIsJoining(false);
   setSelectedRoomId(null);
  },
 });

 const handleJoinRoom = (roomId: string) => {
  setSelectedRoomId(roomId);
  setIsJoining(true);
  joinRoom(roomId);
 };

 const handleSpectateRoom = (roomId: string) => {
  setSelectedRoomId(roomId);
  setIsJoining(true);
  spectateRoom(roomId);
 };

 return {
  navigate,
  username,
  rooms,
  isLoading,
  refetch,
  replays,
  replaysLoading,
  selectedRoomId,
  isJoining,
  handleJoinRoom,
  handleSpectateRoom,
 };
}
