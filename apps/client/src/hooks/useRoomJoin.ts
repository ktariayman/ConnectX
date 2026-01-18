import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, socketEmit, socketOn } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
import { transformRoomData, extractRoomData } from '../lib/transformers';
import { RoomUpdateData, ErrorCallback } from '../types/socket.types';

interface UseRoomJoinOptions {
 onSuccess?: () => void;
 onError?: (error: string) => void;
}

export function useRoomJoin({ onSuccess, onError }: UseRoomJoinOptions = {}) {
 const navigate = useNavigate();
 const { username, setRoom, setPlayerId, setGameState } = useGameStore();

 const joinRoom = useCallback((roomId: string) => {
  if (!username) return;

  const handleRoomJoined = (data: RoomUpdateData) => {
   socket.off('room:updated', handleRoomJoined);
   socket.off('error', handleError);

   const roomData = extractRoomData(data);
   if (!roomData || !roomData.players) return;

   const convertedRoom = transformRoomData(roomData);

   setRoom(convertedRoom);
   setPlayerId(data.playerId || username);
   setGameState(convertedRoom.gameState);

   navigate(`/game/${roomId}`);
   onSuccess?.();
  };

  const handleError: ErrorCallback = (data) => {
   socket.off('room:updated', handleRoomJoined);
   socket.off('error', handleError);
   onError?.(data.message);
  };

  if (!socket.connected) {
   socket.connect();
  } else {
   socket.off('room:updated', handleRoomJoined);
   socket.off('error', handleError);
  }

  socketOn.roomUpdated(handleRoomJoined);
  socketOn.error(handleError);
  socketEmit.joinRoom(roomId, username);
 }, [username, navigate, setRoom, setPlayerId, setGameState, onSuccess, onError]);

 return { joinRoom };
}
