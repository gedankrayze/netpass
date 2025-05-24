import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export async function authMiddleware(request: Request): Promise<{ user?: any; error?: Response }> {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            error: new Response(JSON.stringify({ error: 'Authorization header missing or invalid' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        };
    }

    const token = authHeader.substring(7);
    
    try {
        const user = await authService.validateSession(token);
        
        if (!user) {
            return {
                error: new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                })
            };
        }

        return { user };
    } catch (error) {
        return {
            error: new Response(JSON.stringify({ error: 'Authentication failed' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        };
    }
}