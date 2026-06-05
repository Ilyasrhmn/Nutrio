import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserRole } from '@workspace/common';
import { User } from '../users/entities/user.entity';
import { RolesService } from '../access-control/roles/roles.service';
import { CaslAbilityFactory } from './casl-ability.factory';

interface DatabasePermission {
  action: string;
  subject: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService,
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly dataSource: DataSource,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleLegacy,
      phone: user.phone,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Get roleId from roles table based on enum value
    const roleRecord = await this.rolesService.findByName(registerDto.role.toLowerCase());
    if (!roleRecord) {
      throw new ConflictException(`Role "${registerDto.role}" not found in database`);
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      roleId: roleRecord.id,
      roleLegacy: registerDto.role, // Keep for backward compatibility
    });

    let vendorId: string | undefined;

    if (registerDto.role === UserRole.VENDOR) {
      const businessName = registerDto.businessName || registerDto.fullName;
      const ownerName = registerDto.fullName;
      const phone = registerDto.phone || '000000000';

      const vendorResult: Array<{ id: string }> = await this.dataSource.query(
        `INSERT INTO vendors (user_id, business_name, owner_name, phone, address_street, address_city, address_province, lifecycle_status)
         VALUES ($1, $2, $3, $4, 'TBD', 'TBD', 'Indonesia', 'REGISTERED')
         RETURNING id`,
        [user.id, businessName, ownerName, phone],
      );

      vendorId = vendorResult[0]?.id;

      if (registerDto.eligibilityToken && vendorId) {
        await this.dataSource.query(
          `UPDATE eligibility_sessions SET vendor_id = $1 WHERE session_token = $2::uuid AND vendor_id IS NULL`,
          [vendorId, registerDto.eligibilityToken],
        );
      }
    }

    // Transform response to not include role object
    const { passwordHash: _, role, ...result } = user;
    return {
      ...result,
      // Return role as string for frontend compatibility
      role: registerDto.role,
      ...(vendorId ? { vendorId } : {}),
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ipAddress, userAgent);

    // Transform user data for frontend
    const { passwordHash: _, role, ...userWithoutPassword } = user;
    return {
      user: {
        ...userWithoutPassword,
        // Return role name from database (lowercase)
        role: role?.name || user.roleLegacy || 'public',
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      });

      const tokenHash = await this.hashToken(refreshToken);
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { tokenHash, revokedAt: IsNull() },
        relations: ['user'],
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke current token
      storedToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(storedToken);

      const user = storedToken.user;
      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken, ipAddress, userAgent);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    // Get role name from roleId
    let roleName: string | null = null;
    let roleEnum: UserRole | null = null;
    
    try {
      const roleRecord = await this.rolesService.findOne(user.roleId);
      roleName = roleRecord?.name || null;
      // Map database role name to UserRole enum
      // Database stores lowercase (admin_bgn), enum values are also lowercase
      roleEnum = roleName as UserRole;
    } catch (e) {
      console.warn(`Could not find role record for roleId ${user.roleId}`);
    }

    // Get user permissions from database
    let permissions: DatabasePermission[] = [];
    try {
      const userPermissions = await this.rolesService.getRolePermissions(user.roleId);
      permissions = userPermissions.map(p => ({ action: p.action, subject: p.subject }));
      
      // Cache permissions for this role
      if (roleEnum) {
        await this.abilityFactory.cachePermissions(roleEnum, permissions);
      }
    } catch (e) {
      // If permissions not found, use empty array (will fallback to hardcoded in ability factory)
      console.warn(`Could not load permissions for roleId ${user.roleId}:`, e);
    }

    const permissionStrings = permissions.map(p => `${p.action}:${p.subject}`);
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: roleEnum || roleName, // Use enum if available, fallback to name
      roleId: user.roleId,
      permissions: permissionStrings,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'access-secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken, permissions: permissionStrings };
  }

  private async storeRefreshToken(userId: string, token: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = await this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  private async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
