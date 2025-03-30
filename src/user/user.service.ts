import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type CreateUserData = { email: string; password: string; biometricKey?: string };

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findByBiometricKey(biometricKey: string) {
        return this.prisma.user.findUnique({ where: { biometricKey } })
    }

    async createUser(data: CreateUserData) {
        return this.prisma.user.create({ data });
    }
}