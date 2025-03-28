import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { BiometricInput } from './dto/biometric.input';
import { LoginResponse } from './login.response';
import { AuthPayload } from './auth.payload';


@Resolver('Auth')
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Query(() => String)
    hello() {
        return 'Hello World';
    }

    @Mutation(() => AuthPayload, { name: 'register' })
    async register(@Args('registerInput') registerInput: RegisterInput) {
        return this.authService.register(registerInput);
    }

    @Mutation(() => LoginResponse, { name: 'login' })
    async login(@Args('loginInput') loginInput: LoginInput) {
        const user = await this.authService.validateUser(loginInput.email, loginInput.password);
        if (!user) throw new Error('Invalid Credentials!');

        return this.authService.login(user);
    }

    @Mutation(() => LoginResponse, { name: 'biometricLogin' })
    async biometricLogin(@Args('biometricInput') biometricInput: BiometricInput) {
        return this.authService.biometricLogin(biometricInput.biometricKey);
    }


}
