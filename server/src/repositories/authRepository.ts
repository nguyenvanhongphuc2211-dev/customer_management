import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type { AuthUser, CreateUserDto, LoginDto, UserRecord } from '../types/auth.types.js';
import { ALL_ROLES } from '../types/permissions.js';

const toAuthUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
});

export const createAuthRepository = (store: JsonStore<UserRecord[]>) => ({
  async findAll(): Promise<AuthUser[]> {
    const users = await store.read();
    return users.map(toAuthUser);
  },

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const users = await store.read();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async createUser(dto: CreateUserDto): Promise<AuthUser> {
    const email = dto.email.trim().toLowerCase();
    if (!email || !dto.password || !dto.fullName.trim()) {
      throw new Error('INVALID_USER_DATA');
    }
    if (dto.password.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    if (!ALL_ROLES.includes(dto.role)) {
      throw new Error('INVALID_ROLE');
    }

    return store.transaction(async (users) => {
      if (users.some((u) => u.email.toLowerCase() === email)) {
        throw new Error('EMAIL_EXISTS');
      }

      const user: UserRecord = {
        id: uuidv4(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        fullName: dto.fullName.trim(),
        role: dto.role,
      };

      users.push(user);
      return { next: users, result: toAuthUser(user) };
    });
  },

  async validateLogin(dto: LoginDto): Promise<AuthUser | null> {
    const user = await this.findByEmail(dto.email);
    if (!user) return null;

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) return null;

    return toAuthUser(user);
  },
});

export type AuthRepository = ReturnType<typeof createAuthRepository>;
