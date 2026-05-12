import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { MpesaService } from './mpesa.service';

@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(private readonly mpesaService: MpesaService) {}

  @Post('callback/stk')
  async handleStkCallback(@Body() body: any) {
    this.logger.log('Received STK Push Callback');
    return this.mpesaService.processStkCallback(body);
  }

  @Post('callback/c2b/validation')
  async handleC2BValidation(@Body() body: any) {
    this.logger.log(`Received C2B Validation for: ${body.TransID}`);
    // Always accept in validation unless you have a specific blacklist
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  @Post('callback/c2b/confirmation')
  async handleC2BConfirmation(@Body() body: any) {
    this.logger.log(`Received C2B Confirmation for: ${body.TransID}`);
    return this.mpesaService.processC2BConfirmation(body);
  }
}
