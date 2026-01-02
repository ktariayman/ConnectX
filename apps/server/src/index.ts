import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import router from './presentation/http/router';
import { setupSocketHandlers } from './presentation/websocket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
 cors: {
  origin: '*',
  methods: ['GET', 'POST'],
 },
});

app.use(cors());
app.use(express.json());

app.use('/api', router);

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});
