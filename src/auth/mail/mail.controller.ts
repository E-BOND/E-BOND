import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    // ✅ Ruta de prueba: http://localhost:3000/mail/test?to=yuleibisnoemiarmentacruz@gmail.com
    @Get('test')
    async testEmail(@Query('to') to: string) {
        if (!to) return { error: 'Debes enviar un correo en el parámetro ?to=' };

        await this.mailService.sendVerificationEmail(to, 'token-de-prueba');
        return { message: `Correo de prueba enviado a ${to}` };
    }
}
