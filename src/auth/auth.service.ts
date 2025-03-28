import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { RegisterInput } from './dto/register.input';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    private generateToken(user: { id: string; email: string }) {
        const payload = { email: user.email, sub: user.id };
        return this.jwtService.sign(payload, { secret: this.configService.get<string>('JWT_SECRET') });
    }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (user && (await compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return { access_token: this.generateToken(user) };
    }

    async register(input: RegisterInput) {
        const hashedPassword = await hash(input.password, 10);
        const user = await this.userService.createUser({ email: input.email, password: hashedPassword });

        const { password, ...result } = user;
        return { user: result, token: this.generateToken(user) };

    }

    async biometricLogin(biometricKey: string) {
        const user = await this.userService.findByBiometricKey(biometricKey);
        if (!user) throw new UnauthorizedException();

        return { access_token: this.generateToken(user) };
    }
}
