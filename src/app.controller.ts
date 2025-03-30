import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() { }

    @Get()
    getHello(): string {
        return "Hello, there!";
    }

    @Get('healthz')
    serverHealth() {
        return { status: 'active', message: 'The hood is up Commandliner⚡' };
    }
}
