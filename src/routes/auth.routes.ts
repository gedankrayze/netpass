import { AuthService } from '../services/auth.service';
import { signupSchema, loginSchema } from '../schemas/auth.schema';
import { createErrorResponse } from '../utils/errors';

const authService = new AuthService();

export const authRoutes = {
    '/api/auth/signup': {
        POST: async (request: Request) => {
            try {
                const body = await request.json();
                const data = signupSchema.parse(body);
                const result = await authService.signup(data);
                
                return new Response(JSON.stringify(result), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return createErrorResponse(error);
            }
        }
    },
    
    '/api/auth/login': {
        POST: async (request: Request) => {
            try {
                const body = await request.json();
                const data = loginSchema.parse(body);
                const result = await authService.login(data);
                
                return new Response(JSON.stringify(result), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return createErrorResponse(error);
            }
        }
    },
    
    '/api/auth/logout': {
        POST: async (request: Request) => {
            const authHeader = request.headers.get('Authorization');
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            const token = authHeader.substring(7);
            
            try {
                await authService.logout(token);
                
                return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return createErrorResponse(error);
            }
        }
    }
};