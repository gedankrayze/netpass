export interface User {
    _key?: string;
    _id?: string;
    _rev?: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    emailVerified: boolean;
    profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    custom?: Record<string, any>;
}

export interface Session {
    _key?: string;
    _id?: string;
    _rev?: string;
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    userAgent?: string;
    ipAddress?: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
}