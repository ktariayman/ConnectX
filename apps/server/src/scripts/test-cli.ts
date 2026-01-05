import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import readline from 'readline/promises';

const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
});

async function createRoom(displayName: string) {
 console.log(`\n📡 Creating room via REST for ${displayName}...`);
 const response = await axios.post(`${API_URL}/rooms`, { displayName });
 return response.data;
}

async function joinRoomRest(roomId: string, displayName: string) {
 console.log(`\n📡 Joining room via REST for ${displayName}...`);
 const response = await axios.post(`${API_URL}/rooms/${roomId}/join`, { displayName });
 return response.data;
}

async function createSocket(playerId: string, displayName: string): Promise<Socket> {
 return new Promise((resolve, reject) => {
  const socket = io(BASE_URL, {
   auth: { playerId, displayName }
  });

  socket.on('connect', () => {
   console.log(`✅ Socket connected for ${displayName} (ID: ${socket.id})`);
   resolve(socket);
  });

  socket.on('connect_error', (err) => {
   console.error(`❌ Connection error for ${displayName}:`, err.message);
   reject(err);
  });
 });
}

async function runTest() {
 try {
  console.log('--- 🎮 ConnectX Interactive CLI Test ---');

  // 1. Setup Player 1
  const p1Name = await rl.question('👤 Enter Player 1 Name (default Alice): ') || 'Alice';

  let choice = '';
  while (!['c', 'j'].includes(choice)) {
   choice = (await rl.question('🏢 [C]reate new room or [J]oin existing? (c/j): ') || 'c').toLowerCase();
  }

  let roomId = '';
  let p1Id = '';

  if (choice === 'c') {
   const result = await createRoom(p1Name);
   roomId = result.roomId;
   p1Id = result.playerId;
   console.log(`🏠 Room Created: ${roomId}`);
  } else {
   console.log('� Fetching active rooms...');
   const roomsRes = await axios.get(`${API_URL}/rooms`);
   const rooms = roomsRes.data;

   if (rooms.length === 0) {
    console.log('❌ No active rooms found. Creating one instead...');
    const result = await createRoom(p1Name);
    roomId = result.roomId;
    p1Id = result.playerId;
   } else {
    console.log('\n--- Active Rooms ---');
    rooms.forEach((r: any, i: number) => {
     console.log(`${i + 1}. [${r.id.slice(0, 8)}] - ${r.playerCount}/2 Players (${r.difficulty})`);
    });

    const roomIndex = await rl.question(`\n👉 Select room number (1-${rooms.length}): `);
    const selected = rooms[parseInt(roomIndex) - 1];

    if (!selected) {
     console.error('❌ Invalid selection. Exiting.');
     process.exit(1);
    }

    roomId = selected.id;
    const joinRes = await joinRoomRest(roomId, p1Name);
    p1Id = joinRes.playerId;
   }
  }

  const s1 = await createSocket(p1Id, p1Name);
  s1.emit('room:join', { roomId, displayName: p1Name, playerId: p1Id });

  // 2. Setup Player 2
  const p2Name = await rl.question('\n👤 Enter Player 2 Name (default Bob): ') || 'Bob';
  const joinRes2 = await joinRoomRest(roomId, p2Name);
  const p2Id = joinRes2.playerId;

  const s2 = await createSocket(p2Id, p2Name);
  s2.emit('room:join', { roomId, displayName: p2Name, playerId: p2Id });

  // Global Listeners for Visibility
  const setupListeners = (name: string, socket: Socket) => {
   socket.on('room:updated', (data) => {
    console.log(`\n[${name}] 🔔 Room Updated (Status: ${data.room.gameState.status})`);
    console.log(`   Players: ${data.room.players.map((p: any) => `${p.displayName} (${p.isReady ? 'READY' : 'WAITING'})`).join(' vs ')}`);
   });

   socket.on('game:started', () => {
    console.log(`\n[${name}] 🎮 GAME STARTED!`);
   });

   socket.on('game:move', (data) => {
    console.log(`\n[${name}] 🎲 ${data.move.player} dropped in col ${data.move.column}`);
   });

   socket.on('game:over', (data) => {
    console.log(`\n[${name}] 🏆 GAME OVER! Winner: ${data.gameState.winner || 'Draw'}`);
   });

   socket.on('error', (err) => console.log(`\n[${name}] ❌ ERROR:`, err.message));
  };

  setupListeners(p1Name, s1);
  setupListeners(p2Name, s2);

  // 3. Interactive Loop
  while (true) {
   console.log('\n--- Actions ---');
   console.log('1. Set Ready');
   console.log('2. Make Move');
   console.log('3. Quit');

   const action = await rl.question('👉 Select action (1-3): ');

   if (action === '1') {
    const player = await rl.question(`Who is ready? (1: ${p1Name}, 2: ${p2Name}, b: Both): `);
    if (player === '1' || player === 'b') s1.emit('player:ready');
    if (player === '2' || player === 'b') s2.emit('player:ready');
   }
   else if (action === '2') {
    const turn = await rl.question(`Who is moving? (1: ${p1Name}, 2: ${p2Name}): `);
    const col = await rl.question('Enter column (0-6): ');
    const socket = turn === '1' ? s1 : s2;
    socket.emit('game:move', { roomId, column: parseInt(col) });
   }
   else if (action === '3') {
    console.log('� Goodbye!');
    process.exit(0);
   }
  }

 } catch (err: any) {
  console.error('\n💥 Error:', err.response?.data?.error || err.message);
  process.exit(1);
 }
}

runTest();
