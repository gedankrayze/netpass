import dayjs from 'dayjs';
import db, { collections } from '../config/database';
import type { User } from '../types/user';
import type { UpdateProfileInput, ChangePasswordInput } from '../schemas/user.schema';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { ApiError } from '../utils/errors';

export class UserService {
    private usersCollection = db.collection<User>(collections.users);

    async getProfile(userId: string): Promise<Omit<User, 'password'>> {
        const user = await this.usersCollection.document(userId);
        
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateProfile(userId: string, data: UpdateProfileInput): Promise<Omit<User, 'password'>> {
        const user = await this.usersCollection.document(userId);
        
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        const updatedUser = await this.usersCollection.update(userId, {
            profile: {
                ...user.profile,
                ...data
            },
            updatedAt: dayjs().toISOString()
        }, { returnNew: true });

        const { password, ...userWithoutPassword } = updatedUser.new!;
        return userWithoutPassword;
    }

    async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
        const user = await this.usersCollection.document(userId);
        
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        const isValidPassword = await verifyPassword(data.currentPassword, user.password);
        if (!isValidPassword) {
            throw new ApiError('Current password is incorrect', 401);
        }

        const hashedPassword = await hashPassword(data.newPassword);
        
        await this.usersCollection.update(userId, {
            password: hashedPassword,
            updatedAt: dayjs().toISOString()
        });
    }

    async deleteAccount(userId: string, password: string): Promise<void> {
        const user = await this.usersCollection.document(userId);
        
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            throw new ApiError('Invalid password', 401);
        }

        // Delete all user sessions
        await db.query({
            query: 'FOR s IN sessions FILTER s.userId == @userId REMOVE s IN sessions',
            bindVars: { userId }
        });

        // Delete user
        await this.usersCollection.remove(userId);
    }
}