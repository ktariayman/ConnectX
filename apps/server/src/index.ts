import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import router from './presentation/http/router';
import { WebSocketServer } from './presentation/websocket/WebSocketServer';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api', router);

WebSocketServer.init(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});
