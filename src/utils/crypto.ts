import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10
    });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
}

export function generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
}