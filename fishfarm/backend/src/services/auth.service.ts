import { UserRepository } from '../repositories/user.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { RegisterDTO, LoginDTO, ChangePasswordDTO, UpdateProfileDTO } from '../validators/auth.validator';
import { AppError } from '../utils/app-error';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { sanitizeUser, SafeUser } from '../utils/helpers';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private activityLogRepository: ActivityLogRepository
  ) {}

  async register(dto: RegisterDTO): Promise<{ user: SafeUser; token: string }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const passwordHash = await hashPassword(dto.password);
    
    const user = await this.userRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      role: dto.role,
    });

    await this.activityLogRepository.create({
      user: { connect: { id: user.id } },
      action: 'USER_REGISTERED',
      module: 'AUTH',
    });

    const token = generateToken({ userId: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
  }

  async login(dto: LoginDTO): Promise<{ user: SafeUser; token: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    await this.activityLogRepository.create({
      user: { connect: { id: user.id } },
      action: 'USER_LOGIN',
      module: 'AUTH',
    });

    const token = generateToken({ userId: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<SafeUser> {
    const user = await this.userRepository.update(userId, dto);
    return sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid current password', 401);
    }

    const newPasswordHash = await hashPassword(dto.newPassword);
    await this.userRepository.updatePassword(userId, newPasswordHash);

    await this.activityLogRepository.create({
      user: { connect: { id: user.id } },
      action: 'PASSWORD_CHANGED',
      module: 'AUTH',
    });
  }
}
