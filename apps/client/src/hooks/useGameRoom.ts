import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../lib/api';
import { socket, socketEmit, socketOn, socketOff } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
import { transformRoomData, extractRoomData, transformGameState } from '../lib/transformers';
import { RoomUpdateData, RoomData } from '../types/socket.types';
import { GAME_STATUS } from '@connect-x/shared';

export function useGameRoom(roomId: string | undefined, isSpectatorMode: boolean) {
 const navigate = useNavigate();
 const {
  room,
  playerId,
  gameState,
  context,
  setRoom,
  setGameState,
  setContext,
 } = useGameStore();

 const [gameOverReason, setGameOverReason] = useState<string | null>(null);
 const [showResultModal, setShowResultModal] = useState(false);
 const isSpectator = context?.isSpectator ?? false;

 // Fetch room data if needed
 const needsFetch = !!roomId && (!room || room.id !== roomId);
 const pollInterval = gameState?.status === GAME_STATUS.WAITING ? 3000 : undefined;

 const { data: roomData, isLoading } = useQuery({
  queryKey: ['room', roomId],
  queryFn: () => roomApi.get(roomId!),
  enabled: needsFetch || !!pollInterval,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchInterval: pollInterval,
 });

 // Update room when data is fetched
 useEffect(() => {
  if (roomData) {
   const convertedRoom = transformRoomData(roomData);
   setRoom(convertedRoom);
   setGameState(convertedRoom.gameState);
  }
 }, [roomData, setRoom, setGameState]);

 // Socket event handlers
 useEffect(() => {
  if (!playerId || !roomId) return;
  if (!socket.connected) socket.connect();

  const handleRoomUpdate = (data: RoomUpdateData) => {
   const newGameState = data.gameState || (data.room ? data.room.gameState : null);
   if (newGameState) {
    const convertedGameState = transformGameState(newGameState);
    setGameState(convertedGameState);
   }

   if (data.context) {
    setContext(data.context as any);
   }

   if (data.turnStartedAt) {
    useGameStore.setState((state) => ({
     room: state.room ? { ...state.room, turnStartedAt: new Date(data.turnStartedAt!) } : null
    }));
   }

   const roomData = data.room || (data.players ? (data as unknown as RoomData) : null);
   if (roomData && roomData.players) {
    const convertedRoom = transformRoomData(roomData);
    useGameStore.setState((state) => ({
     room: state.room ? { ...state.room, ...convertedRoom } : convertedRoom
    }));
   }
  };

  const handleGameStarted = () => {
   // Game started
  };

  const handleGameOver = (data: any) => {
   setGameOverReason(data.reason || null);
   setShowResultModal(true);
  };

  socketOn.roomUpdated(handleRoomUpdate);
  socketOn.gameStarted(handleGameStarted);
  socketOn.gameOver(handleGameOver);

  return () => {
   socketOff.all();
  };
 }, [roomId, playerId, setRoom, setGameState, setContext]);

 // Join room
 useEffect(() => {
  if (socket.connected && roomId && playerId) {
   if (isSpectatorMode || isSpectator) {
    socketEmit.spectateRoom(roomId, playerId);
   } else if (room?.players?.has(playerId)) {
    socketEmit.joinRoom(roomId, playerId);
   }
  }
 }, [socket.connected, roomId, playerId, isSpectatorMode, isSpectator, !!room]);

 // Handle leave
 const handleLeave = useCallback(() => {
  if (isSpectator) {
   socketEmit.leaveSpectate();
  } else {
   socketEmit.leaveRoom();
  }
  navigate('/');
 }, [isSpectator, navigate]);

 // Cleanup on unmount
 useEffect(() => {
  return () => {
   if (roomId && playerId && !isSpectator) {
    socketEmit.leaveRoom();
   }
  };
 }, [roomId, playerId, isSpectator]);

 // Handle browser close
 useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
   if (gameState?.status === GAME_STATUS.IN_PROGRESS) {
    e.preventDefault();
    e.returnValue = '';
   }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [gameState?.status]);

 return {
  room,
  playerId,
  gameState,
  context,
  isSpectator,
  isLoading,
  gameOverReason,
  showResultModal,
  setShowResultModal,
  handleLeave,
 };
}
