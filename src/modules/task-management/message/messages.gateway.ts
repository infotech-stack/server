import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ 
  cors: {
    origin: '*'
  },
  port: 4000,
})
export class MessagesGateway implements  OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService
  ) {}



  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() createMessageDto: any): Promise<void> {
    const response = await this.messagesService.saveMessage(createMessageDto);
    this.server.emit('message', response.data);
  }
}
