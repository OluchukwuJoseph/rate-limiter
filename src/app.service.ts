import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHelloMessage(): string {
    return 'Thanks for dropping by 👋';
  }
}
