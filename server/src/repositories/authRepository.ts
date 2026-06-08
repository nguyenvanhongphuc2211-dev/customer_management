import bcrypt from 'bcryptjs';
import type { JsonStore } from '../storage/jsonStore.js';
import type { AuthUser, LoginDto, UserRecord } from '../types/auth.types.js';

export const createAuthRepository = (store: JsonStore<UserRecord[]>) => ({
  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const users = await store.read();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async validateLogin(dto: LoginDto): Promise<AuthUser | null> {
    const user = await this.findByEmail(dto.email);
    if (!user) return null;

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  },
});

export type AuthRepository = ReturnType<typeof createAuthRepository>;
