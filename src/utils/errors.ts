import { ZodError } from 'zod';

export class ApiError extends Error {
    constructor(
        public override message: string,
        public statusCode: number = 400,
        public errors?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function formatZodError(error: ZodError): { message: string; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(err.message);
    });
    
    return {
        message: 'Validation failed',
        errors
    };
}

export function createErrorResponse(error: unknown): Response {
    if (error instanceof ApiError) {
        return new Response(JSON.stringify({
            error: error.message,
            ...(error.errors && { errors: error.errors })
        }), {
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (error instanceof ZodError) {
        const formatted = formatZodError(error);
        return new Response(JSON.stringify(formatted), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
}