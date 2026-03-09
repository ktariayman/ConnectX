import { useState, useEffect, useRef, useCallback } from 'react';
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

 // Fetch room data — only when we don't have a matching room in memory
 const needsFetch = !!roomId && (!room || room.id !== roomId);
 const pollInterval = gameState?.status === GAME_STATUS.WAITING ? 3000 : undefined;

 const { data: roomData, isLoading } = useQuery({
  queryKey: ['room', roomId],
  queryFn: () => roomApi.get(roomId!),
  enabled: needsFetch || !!pollInterval,
  refetchOnWindowFocus: false,  // avoid spurious re-fetches
  refetchOnMount: true,
  refetchInterval: pollInterval,
 });

 // Apply HTTP-fetched room to store
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

    if (convertedGameState.status !== GAME_STATUS.FINISHED) {
     setShowResultModal(false);
     setGameOverReason(null);
    }
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
   setShowResultModal(false);
   setGameOverReason(null);
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

 // Join / rejoin room — emit as soon as socket is ready.
 // Use a ref to track the previous roomId so we reset context when switching rooms,
 // without triggering a full re-render cascade.
 const prevRoomId = useRef<string | undefined>(undefined);

 useEffect(() => {
  if (!roomId || !playerId) return;

  // When switching to a different room, clear stale context so the board
  // doesn't stay disabled with old isMyTurn=false.
  if (prevRoomId.current && prevRoomId.current !== roomId) {
   setContext(null as any);
  }
  prevRoomId.current = roomId;

  const emitJoin = () => {
   if (!roomId || !playerId) return;
   if (isSpectatorMode) {
    socketEmit.spectateRoom(roomId, playerId);
   } else {
    socketEmit.joinRoom(roomId, playerId);
   }
  };

  // Emit immediately if connected; otherwise connect first
  if (socket.connected) {
   emitJoin();
  } else {
   socket.connect();
  }

  // Handle reconnects (brief network drops dispatch 'connect' again)
  socket.on('connect', emitJoin);

  return () => {
   socket.off('connect', emitJoin);
  };
 }, [roomId, playerId, isSpectatorMode]);

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

 // Warn before closing tab during an active game
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
