import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { DocumentationProvider } from './infrastructure/docs/DocumentationProvider';
import router from './presentation/http/router';
import { WebSocketServer } from './presentation/websocket/WebSocketServer';
import { initializeConnections } from './registry';
import config from './config';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

DocumentationProvider.init(app);

app.use('/api', router);

WebSocketServer.init(httpServer);

app.get('/health', async (req, res) => {
 const health = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  database: 'redis',
 };

 res.json(health);
});

async function startServer() {
 try {
  console.log(' Starting ConnectX Server...');
  console.log(` Node Environment: ${config.nodeEnv}`);
  console.log(` Database: Redis`);

  await initializeConnections();

  const PORT = config.port;
  httpServer.listen(PORT, () => {
   console.log(` Server running on http://localhost:${PORT}`);
   console.log(` Swagger docs available at http://localhost:${PORT}/api-docs`);
   console.log(` Health check available at http://localhost:${PORT}/health`);
  });
 } catch (error) {
  console.error(' Failed to start server:', error);
  process.exit(1);
 }
}
startServer();
