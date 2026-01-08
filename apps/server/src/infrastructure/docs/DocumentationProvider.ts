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
        const socketApiDocPath = join(__dirname, '../../../../SOCKET_API.md');
        let socketDoc = '';
        try {
            socketDoc = fs.readFileSync(socketApiDocPath, 'utf-8');
        } catch (err) {
            console.warn('Could not load SOCKET_API.md', err);
        }

        const options = {
            info: {
                version: '1.0.0',
                title: 'ConnectX API & Events',
                description: `
## API Documentation for ConnectX
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
