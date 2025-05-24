import { serve } from 'bun';
import { initDatabase } from './config/database';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';

// Try to initialize database but don't fail if it's not available
try {
    await initDatabase();
} catch (error) {
    console.error('⚠️  Database connection failed:', error instanceof Error ? error.message : error);
    console.log('🚀 Starting server without database connection...');
}

const routes = {
    '/': (_request: Request) => new Response('Welcome to NetPass API!'),
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
        
        for (const [routePath, handler] of Object.entries(routes)) {
            if (routePath.endsWith('*')) {
                const baseRoute = routePath.slice(0, -1);
                if (path.startsWith(baseRoute)) {
                    if (typeof handler === 'function') {
                        return handler(request);
                    }
                }
            } else if (path === routePath) {
                if (typeof handler === 'function') {
                    return handler(request);
                } else if (typeof handler === 'object' && request.method in handler) {
                    const method = request.method as string;
                    const methodHandler = (handler as any)[method];
                    if (typeof methodHandler === 'function') {
                        return methodHandler(request);
                    }
                }
            }
        }
        
        return new Response('Not found', { status: 404 });
    }
});

console.log(`NetPass API listening on ${server.hostname}:${server.port}`);