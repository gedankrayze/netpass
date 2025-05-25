import { serve } from 'bun';
import { initDatabase } from './config/database';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { corsMiddleware, addCorsHeaders } from './middleware/cors.middleware';
import { join } from 'path';

// Try to initialize database but don't fail if it's not available
try {
    await initDatabase();
} catch (error) {
    console.error('⚠️  Database connection failed:', error instanceof Error ? error.message : error);
    console.log('🚀 Starting server without database connection...');
}

const routes = {
    '/': async (_request: Request) => {
        const htmlPath = join(process.cwd(), 'public', 'index.html');
        const file = Bun.file(htmlPath);
        
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            });
        }
        
        return new Response('Welcome to NetPass API!');
    },
    '/docs': async (_request: Request) => {
        const docsPath = join(process.cwd(), 'public', 'docs.html');
        const file = Bun.file(docsPath);
        
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            });
        }
        
        return new Response('Documentation not found', { status: 404 });
    },
    '/version': (_request: Request) => new Response(`1.0.0/core-${Bun.version}`),
    ...authRoutes,
    ...userRoutes,
    '/api/*': (_request: Request) => Response.json({ message: 'Not found' }, { status: 404 })
};

const server = serve({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    hostname: process.env.HOST || '0.0.0.0',
    
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // Handle CORS preflight requests
        const corsResponse = corsMiddleware(request);
        if (corsResponse) {
            return corsResponse;
        }
        
        // Check for routes first
        for (const [routePath, handler] of Object.entries(routes)) {
            if (routePath.endsWith('*')) {
                const baseRoute = routePath.slice(0, -1);
                if (path.startsWith(baseRoute)) {
                    if (typeof handler === 'function') {
                        const response = await handler(request);
                        return addCorsHeaders(response, request);
                    }
                }
            } else if (path === routePath) {
                if (typeof handler === 'function') {
                    const response = await handler(request);
                    return addCorsHeaders(response, request);
                } else if (typeof handler === 'object' && request.method in handler) {
                    const method = request.method as string;
                    const methodHandler = (handler as any)[method];
                    if (typeof methodHandler === 'function') {
                        const response = await methodHandler(request);
                        return addCorsHeaders(response, request);
                    }
                }
            }
        }
        
        // Try to serve static files from public folder
        if (path !== '/' && !path.startsWith('/api')) {
            const filePath = join(process.cwd(), 'public', path);
            const file = Bun.file(filePath);
            
            if (await file.exists()) {
                const response = new Response(file);
                return addCorsHeaders(response, request);
            }
        }
        
        const notFoundResponse = new Response('Not found', { status: 404 });
        return addCorsHeaders(notFoundResponse, request);
    }
});

console.log(`NetPass API listening on ${server.hostname}:${server.port}`);