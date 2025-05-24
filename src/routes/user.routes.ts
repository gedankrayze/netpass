import { authMiddleware } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { updateProfileSchema, changePasswordSchema } from '../schemas/user.schema';
import { createErrorResponse } from '../utils/errors';
import { z } from 'zod';

const userService = new UserService();

export const userRoutes = {
    '/api/users/profile': {
        GET: async (request: Request) => {
            const { user, error } = await authMiddleware(request);
            
            if (error) {
                return error;
            }
            
            return new Response(JSON.stringify(user), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        },
        
        PATCH: async (request: Request) => {
            const { user, error: authError } = await authMiddleware(request);
            
            if (authError) {
                return authError;
            }
            
            try {
                const body = await request.json();
                const data = updateProfileSchema.parse(body);
                const updatedUser = await userService.updateProfile(user._key!, data);
                
                return new Response(JSON.stringify(updatedUser), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return createErrorResponse(error);
            }
        }
    },
    
    '/api/users/change-password': {
        POST: async (request: Request) => {
            const { user, error: authError } = await authMiddleware(request);
            
            if (authError) {
                return authError;
            }
            
            try {
                const body = await request.json();
                const data = changePasswordSchema.parse(body);
                await userService.changePassword(user._key!, data);
                
                return new Response(JSON.stringify({ message: 'Password changed successfully' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return createErrorResponse(error);
            }
        }
    },
    
    '/api/users/delete': {
        DELETE: async (request: Request) => {
            const { user, error: authError } = await authMiddleware(request);
            
            if (authError) {
                return authError;
            }
            
            try {
                const body = await request.json();
                const { password } = z.object({ password: z.string() }).parse(body);
                await userService.deleteAccount(user._key!, password);
                
                return new Response(JSON.stringify({ message: 'Account deleted successfully' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return createErrorResponse(error);
            }
        }
    }
};