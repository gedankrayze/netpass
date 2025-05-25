export function corsMiddleware(request: Request): Response | null {
    // Get allowed origins from environment or use default
    const allowedOrigins = process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['*'];
    
    const origin = request.headers.get('Origin') || '*';
    const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': isAllowed ? origin : '',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            }
        });
    }
    
    // For non-preflight requests, return null to continue processing
    return null;
}

export function addCorsHeaders(response: Response, request: Request): Response {
    const allowedOrigins = process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['*'];
    
    const origin = request.headers.get('Origin') || '*';
    const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
    
    if (isAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    return response;
}