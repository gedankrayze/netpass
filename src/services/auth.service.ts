import dayjs from 'dayjs';
import db, { collections } from '../config/database';
import type { User, Session, AuthResponse } from '../types/user';
import type { SignupInput, LoginInput } from '../schemas/auth.schema';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';
import { ApiError } from '../utils/errors';

export class AuthService {
    private usersCollection = db.collection<User>(collections.users);
    private sessionsCollection = db.collection<Session>(collections.sessions);

    async signup(data: SignupInput): Promise<AuthResponse> {
        // Check if signup is allowed
        const allowSignup = process.env.ALLOW_SIGNUP === 'true';
        if (!allowSignup) {
            throw new ApiError('New user registration is currently disabled', 403);
        }

        const existingEmail = await db.query({
            query: 'FOR u IN users FILTER u.email == @email RETURN u',
            bindVars: { email: data.email }
        });

        if (existingEmail.hasNext) {
            throw new ApiError('Email already registered', 409);
        }

        const existingUsername = await db.query({
            query: 'FOR u IN users FILTER u.username == @username RETURN u',
            bindVars: { username: data.username }
        });

        if (existingUsername.hasNext) {
            throw new ApiError('Username already taken', 409);
        }

        const hashedPassword = await hashPassword(data.password);
        const now = dayjs().toISOString();

        const user: User = {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
            isActive: true,
            emailVerified: false,
            profile: {
                firstName: data.firstName,
                lastName: data.lastName
            },
            custom: {}
        };

        const result = await this.usersCollection.save(user, { returnNew: true });
        const newUser = result.new!;

        const session = await this.createSession(newUser._key!);
        
        const { password, ...userWithoutPassword } = newUser;
        
        return {
            user: userWithoutPassword,
            token: session.token
        };
    }

    async login(data: LoginInput): Promise<AuthResponse> {
        // Opportunistic cleanup: Clean expired sessions 10% of the time
        if (Math.random() < 0.1) {
            this.cleanupExpiredSessions().catch(err => 
                console.error('Background session cleanup failed:', err)
            );
        }

        const query = await db.query<User>({
            query: 'FOR u IN users FILTER u.username == @username OR u.email == @username RETURN u',
            bindVars: { username: data.username }
        });

        const user = await query.next();
        
        if (!user) {
            throw new ApiError('Invalid credentials', 401);
        }

        const passwordValid = await verifyPassword(data.password, user.password);
        if (!passwordValid) {
            throw new ApiError('Invalid credentials', 401);
        }

        if (!user.isActive) {
            throw new ApiError('Account is inactive', 403);
        }

        const session = await this.createSession(user._key!);
        
        const { password, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            token: session.token
        };
    }

    async logout(token: string): Promise<void> {
        await db.query({
            query: 'FOR s IN sessions FILTER s.token == @token REMOVE s IN sessions',
            bindVars: { token }
        });
    }

    async validateSession(token: string): Promise<User | null> {
        const query = await db.query<Session & { user: User }>({
            query: `
                FOR s IN sessions
                FILTER s.token == @token AND s.expiresAt > @now
                FOR u IN users
                FILTER u._key == s.userId
                RETURN MERGE(s, { user: u })
            `,
            bindVars: { 
                token,
                now: dayjs().toISOString()
            }
        });

        const result = await query.next();
        
        if (!result) {
            return null;
        }

        const { password, ...userWithoutPassword } = result.user;
        return userWithoutPassword as User;
    }

    private async createSession(userId: string): Promise<Session> {
        const token = generateToken();
        const now = dayjs();
        const ttlDays = parseInt(process.env.JWT_TTL_DAYS || '7', 10);
        
        const session: Session = {
            userId,
            token,
            createdAt: now.toISOString(),
            expiresAt: now.add(ttlDays, 'days').toISOString()
        };

        const result = await this.sessionsCollection.save(session, { returnNew: true });
        return result.new!;
    }

    async cleanupExpiredSessions(): Promise<number> {
        const now = dayjs().toISOString();
        
        const result = await db.query(
            `FOR s IN sessions 
             FILTER s.expiresAt < @now 
             REMOVE s IN sessions 
             RETURN OLD`,
            { now }
        );
        
        const deletedSessions = await result.all();
        return deletedSessions.length;
    }
}

export const authService = new AuthService();