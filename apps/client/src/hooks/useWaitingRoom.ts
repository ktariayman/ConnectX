import { useMemo } from 'react';
import { socketEmit } from '../lib/socket';
import { Room } from '@connect-x/shared';

export function useWaitingRoom(room: Room | null, currentUserId: string) {
 const players = useMemo(() =>
  room ? Array.from(room.players.values()) : [],
  [room?.players]
 );

 const me = room?.players.get(currentUserId);

 const spectators = useMemo(() => {
  if (!room?.spectators) return new Set<string>();
  return room.spectators instanceof Set
   ? room.spectators
   : Array.isArray(room.spectators)
    ? new Set(room.spectators)
    : new Set<string>();
 }, [room?.spectators]);

 const isSpectator = spectators.has(currentUserId) || (!!room && !me);

 const isReady = me?.isReady || false;
 const otherPlayerSet = players.find(p => p.id !== currentUserId);
 const waitingForPlayers = players.length < 2;

 const handleReady = () => {
  socketEmit.playerReady();
 };

 return {
  players,
  spectators,
  isSpectator,
  isReady,
  otherPlayerSet,
  waitingForPlayers,
  handleReady,
 };
}
