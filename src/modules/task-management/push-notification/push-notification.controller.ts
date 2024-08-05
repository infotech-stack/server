import { Controller, Post, Body, Get } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';

@Controller('notifications')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

 
  @Post('subscribe')
  async subscribe(@Body() body: any) {
   
    
    await this.pushNotificationService.addSubscription(body.subscription, body.message);
    return { success: true };
  }

  @Get('send')
  async sendNotification() {
   
    
    await this.pushNotificationService.sendNotification();
    return { success: true };
  }
}
