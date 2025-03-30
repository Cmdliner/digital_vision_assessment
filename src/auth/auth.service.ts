import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { RegisterInput } from './dto/register.input';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    private generateToken(user: { id: string; email: string; }) {
        const payload = { email: user.email, sub: user.id };
        return this.jwtService.sign(payload, { secret: this.configService.get<string>('JWT_SECRET') });
    }

    async validateUser(email: string, pass: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid email or password!');

        const passwordsMatch = await compare(pass, user.password)
        if (!passwordsMatch) throw new UnauthorizedException('Invalid email or password!');
        const { password, ...result } = user;
        return result;

    }

    async login(user: { email: string; id: string; }) {
        const payload = { email: user.email, id: user.id };
        return { access_token: this.generateToken(payload) };
    }

    async register(input: RegisterInput) {
        try {
            const hashedPassword = await hash(input.password, 10);
            const user = await this.userService.createUser({ email: input.email, password: hashedPassword });

            const { password, ...result } = user;
            return { user: result, token: this.generateToken(user) };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Email already in use');
                }
            }
            throw error;
        }

    }

    async biometricLogin(biometricKey: string) {
        const user = await this.userService.findByBiometricKey(biometricKey);
        if (!user) throw new UnauthorizedException('Biometric data mismatch');

        return { access_token: this.generateToken(user) };
    }
}
