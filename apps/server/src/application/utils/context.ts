import { Room, Player, DIFFICULTY_LEVELS, GAME_STATUS, PLAYER_TYPE, PLAYER_COLOR, PlayerColor } from '@connect-x/shared';

export interface GameContext {
 isMyTurn: boolean;
 myColor?: PlayerColor;
 activeColor?: PlayerColor;
 opponentName?: string;
 status: string;
 timeLeft?: number;
 isSpectator: boolean;
 isCreator: boolean;
}

export function calculateGameContext(room: Room, playerId: string): GameContext {
 const players = Array.from(room.players.values());
 const me = room.players.get(playerId);
 const opponent = players.find(p => p.id !== playerId);
 const isSpectator = room.spectators.has(playerId);

 const isRedTurn = room.gameState.currentPlayer === PLAYER_TYPE.PLAYER_1;
 const activeColor = isRedTurn ? PLAYER_COLOR.RED : PLAYER_COLOR.BLUE;
 const isMyTurn = !isSpectator && me ? me.color === activeColor : false;

 let timeLeft: number | undefined;
 if (room.gameState.status === GAME_STATUS.IN_PROGRESS && room.turnStartedAt) {
  const limit = DIFFICULTY_LEVELS[room.difficulty].turnTimeSeconds;
  const elapsed = (Date.now() - room.turnStartedAt.getTime()) / 1000;
  timeLeft = Math.max(0, Math.floor(limit - elapsed));
 }

 return {
  isMyTurn,
  myColor: me?.color,
  activeColor,
  opponentName: opponent?.id,
  status: room.gameState.status,
  timeLeft,
  isSpectator,
  isCreator: room.creatorId === playerId
 };
}
