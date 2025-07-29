import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  root() {
    const message = this.appService.getHelloMessage();
    return {
      status: 'success',
      message,
    };
  }

  @Get('/api/v1')
  getHelloMessage() {
    const message = this.appService.getHelloMessage();
    return {
      status: 'success',
      message,
    };
  }
}
