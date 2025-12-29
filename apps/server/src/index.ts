import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
 cors: {
  origin: '*',
 }
});

app.get('/', (req, res) => {
 res.json({ status: 'ok', message: 'ConnectX Server is running' });
});


const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
