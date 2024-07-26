import { Module } from '@nestjs/common';
import { MessagesService } from './message.service';
import { MessagesGateway } from './message.gateway';

@Module({
  providers: [MessagesGateway, MessagesService]
})
export class MessageModule {}
