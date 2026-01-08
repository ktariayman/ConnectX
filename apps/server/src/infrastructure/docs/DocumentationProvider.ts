import expressJSDocSwagger from 'express-jsdoc-swagger';
import { Express } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DocumentationProvider {
    public static init(app: Express): void {
        const isEnabled = process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';

        if (!isEnabled) {
            console.log('📄 Swagger documentation is disabled.');
            return;
        }

        // Read the Socket API Markdown to include it in the description
        const socketApiDocPath = join(__dirname, '../../../SOCKET_API.md');
        let socketDoc = '';
        try {
            if (fs.existsSync(socketApiDocPath)) {
                socketDoc = fs.readFileSync(socketApiDocPath, 'utf-8');
                console.log('✅ SOCKET_API.md loaded successfully');
            } else {
                console.warn(`⚠️ SOCKET_API.md not found at: ${socketApiDocPath}`);
            }
        } catch (err) {
            console.error('❌ Error loading SOCKET_API.md:', err);
        }

        const options = {
            info: {
                version: '1.0.0',
                title: 'ConnectX API & Events',
                description: `
## 🚀 ConnectX API Documentation

This documentation covers both **REST API endpoints** and **WebSocket events** for the ConnectX game server.

---

${socketDoc}
        `,
                license: {
                    name: 'MIT',
                },
            },
            // Since this file is in src/infrastructure/docs, we go up to src
            baseDir: join(__dirname, '../../'),
            filesPattern: './**/*.ts',
            swaggerUIPath: '/api-docs',
            exposeSwaggerUI: true,
            exposeApiDocs: true,
            apiDocsPath: '/v3/api-docs',
            notRequiredAsNullable: false,
            swaggerUiOptions: {},
        };

        expressJSDocSwagger(app)(options);
        console.log('📄 Swagger docs initialized.');
    }
}
