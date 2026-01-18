import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameHistoryApi } from '../lib/api';
import { CellState, BoardConfig, Move, createEmptyBoard, CELL_STATE, PLAYER_COLOR } from '@connect-x/shared';

export function useReplay(roomId: string | undefined) {
 const navigate = useNavigate();
 const [moveHistory, setMoveHistory] = useState<Move[]>([]);
 const [config, setConfig] = useState<BoardConfig | null>(null);
 const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
 const [isPlaying, setIsPlaying] = useState(false);
 const [playbackSpeed, setPlaybackSpeed] = useState(1);
 const [board, setBoard] = useState<CellState[][]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const playIntervalRef = useRef<number | null>(null);

 useEffect(() => {
  if (!roomId) return;

  const fetchRoom = async () => {
   try {
    const game = await gameHistoryApi.getByRoomId(roomId);
    setMoveHistory(game.moveHistory || []);
    setConfig(game.config);
    setBoard(createEmptyBoard(game.config));
    setLoading(false);
   } catch (err) {
    setError('Failed to load replay. Game may not exist.');
    setLoading(false);
   }
  };

  fetchRoom();
 }, [roomId]);

 const reconstructBoard = useCallback((targetIndex: number): CellState[][] => {
  if (!config) return [];

  const newBoard = createEmptyBoard(config);

  for (let i = 0; i <= targetIndex; i++) {
   const move = moveHistory[i];
   if (move) {
    newBoard[move.row][move.column] = move.player;
   }
  }

  return newBoard;
 }, [config, moveHistory]);

 useEffect(() => {
  if (config) {
   setBoard(reconstructBoard(currentMoveIndex));
  }
 }, [currentMoveIndex, config, reconstructBoard]);

 useEffect(() => {
  if (isPlaying && currentMoveIndex < moveHistory.length - 1) {
   const delay = 1000 / playbackSpeed;
   playIntervalRef.current = window.setInterval(() => {
    setCurrentMoveIndex((prev) => {
     if (prev >= moveHistory.length - 1) {
      setIsPlaying(false);
      return prev;
     }
     return prev + 1;
    });
   }, delay);
  } else if (playIntervalRef.current) {
   clearInterval(playIntervalRef.current);
   playIntervalRef.current = null;
  }

  return () => {
   if (playIntervalRef.current) {
    clearInterval(playIntervalRef.current);
   }
  };
 }, [isPlaying, currentMoveIndex, moveHistory.length, playbackSpeed]);

 const handlePlay = () => setIsPlaying(true);
 const handlePause = () => setIsPlaying(false);

 const handleStepForward = () => {
  if (currentMoveIndex < moveHistory.length - 1) {
   setCurrentMoveIndex(currentMoveIndex + 1);
  }
 };

 const handleStepBackward = () => {
  if (currentMoveIndex >= 0) {
   setCurrentMoveIndex(currentMoveIndex - 1);
  }
 };

 const handleJumpToStart = () => {
  setCurrentMoveIndex(-1);
  setIsPlaying(false);
 };

 const handleJumpToEnd = () => {
  setCurrentMoveIndex(moveHistory.length - 1);
  setIsPlaying(false);
 };

 const handleSeek = (index: number) => {
  setCurrentMoveIndex(index);
  setIsPlaying(false);
 };

 const handleSpeedChange = (speed: number) => {
  setPlaybackSpeed(speed);
 };

 const currentMove = currentMoveIndex >= 0 ? moveHistory[currentMoveIndex] : null;
 const currentPlayer = currentMove?.player === CELL_STATE.PLAYER_1 ? PLAYER_COLOR.RED : currentMove?.player === CELL_STATE.PLAYER_2 ? PLAYER_COLOR.BLUE : null;

 return {
  navigate,
  board,
  config,
  loading,
  error,
  currentMove,
  currentPlayer,
  controls: {
   currentMove: currentMoveIndex,
   totalMoves: moveHistory.length,
   isPlaying,
   playbackSpeed,
   onPlay: handlePlay,
   onPause: handlePause,
   onStepForward: handleStepForward,
   onStepBackward: handleStepBackward,
   onJumpToStart: handleJumpToStart,
   onJumpToEnd: handleJumpToEnd,
   onSeek: handleSeek,
   onSpeedChange: handleSpeedChange,
  }
 };
}
